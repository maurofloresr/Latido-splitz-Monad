// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Latido {

    using SafeERC20 for IERC20;

    // ================================================================
    // VARIABLES GLOBALES
    // ================================================================

    IERC20 public usdt;

    // Fee de 0.01% representado en basis points (1 / 10_000)
    uint public constant LATIGO_FEE = 1;



    // ================================================================
    // CONSTRUCTOR con nuestra wallet
    // ================================================================
    address public feeRecipient;

    constructor(address _usdt, address _feeRecipient) {
        usdt = IERC20(_usdt);
        feeRecipient = _feeRecipient;
    }


    // ================================================================
    // ESTRUCTURAS DE DATOS
    // ================================================================

    // Representa a un familiar/dependiente
    struct Dependent {
        uint balance;       // Saldo disponible para gastar (en USDT con 6 decimales)
        bool active;        // Si la cuenta está activa
    }

    // Representa un pedido de más plata del dependiente al guardian
    struct Request {
        address dependent;  // Quien pidió
        uint amount;        // Cuánto pidió
        string reason;      // Por qué lo pidió
        bool pending;       // Si todavía está sin resolver
    }

    // Representa un pago realizado por el dependiente
    struct Payment {
        uint amount;        // Cuánto gastó
        string description; // En qué lo gastó
        uint timestamp;     // Cuándo lo hizo
    }


    // ================================================================
    // MAPPINGS (base de datos on-chain)
    // ================================================================

    // dependent => guardian: dado un dependiente, quién es su guardian
    // ETHERS.JS: guardianOf(dependentAddress) → devuelve address del guardian
    mapping(address => address) public guardianOf;

    // dependent => sus datos
    // ETHERS.JS: dependents(dependentAddress) → devuelve struct Dependent
    mapping(address => Dependent) public dependents;

    // requestId => datos del request
    // ETHERS.JS: requests(requestId) → devuelve struct Request
    mapping(uint => Request) public requests;

    // guardian => lista de IDs de requests que le hicieron
    // ETHERS.JS: usar getPendingRequests(guardianAddress)
    mapping(address => uint[]) public guardianRequests;

    // dependent => historial de pagos
    // ETHERS.JS: usar getPaymentHistory(dependentAddress)
    mapping(address => Payment[]) public paymentHistory;

    // guardian => lista de addresses de sus dependientes
    // ETHERS.JS: usar getDependents(guardianAddress)
    mapping(address => address[]) public guardianDependents;

    // Contador global de requests
    uint public requestCount;


    // ================================================================
    // EVENTOS (el frontend los escucha para reaccionar en tiempo real)
    // ================================================================

    // ETHERS.JS: contract.on("Spent", (dependent, amount, description) => {})
    event Spent(address indexed dependent, uint amount, string description);

    // ETHERS.JS: contract.on("RequestCreated", (dependent, amount, reason) => {})
    event RequestCreated(address indexed dependent, uint amount, string reason);

    // ETHERS.JS: contract.on("RequestApproved", (requestId) => {})
    event RequestApproved(uint requestId);

    // ETHERS.JS: contract.on("InsufficientFunds", (dependent, attempted, available) => {})
    // El frontend escucha esto para mostrar el cartel y ofrecer pedir más plata
    event InsufficientFunds(address indexed dependent, uint attempted, uint available);

    // ETHERS.JS: contract.on("DependentRemoved", (dependent) => {})
    event DependentRemoved(address indexed dependent);

    // ETHERS.JS: contract.on("Funded", (dependent, amount) => {})
    event Funded(address indexed dependent, uint amount);


    // ================================================================
    // FUNCIONES DEL GUARDIAN
    // ================================================================

    // Agregar un nuevo dependiente
    // ETHERS.JS: await contract.addDependent(dependentAddress)
    function addDependent(address _dependent) external {
        require(!dependents[_dependent].active, "Ya existe");
        require(_dependent != address(0), "Direccion invalida");

        dependents[_dependent] = Dependent({
            balance: 0,
            active: true
        });

        guardianOf[_dependent] = msg.sender;
        guardianDependents[msg.sender].push(_dependent);
    }

    // Guardian deposita USDT al contrato para que el dependiente pueda gastar
    // IMPORTANTE: Antes de llamar esto, el guardian debe hacer approve() en el contrato de USDT
    // ETHERS.JS:
    //   await usdtContract.approve(latigoAddress, amount)  ← primero esto
    //   await contract.fundDependent(dependentAddress, amount)  ← luego esto
    function fundDependent(address _dependent, uint _amount) external {
        require(guardianOf[_dependent] == msg.sender, "No sos el guardian");
        require(_amount > 0, "Monto invalido");

        usdt.transferFrom(msg.sender, address(this), _amount);
        dependents[_dependent].balance += _amount;

        emit Funded(_dependent, _amount);
    }

    // Guardian le saca plata al dependiente
    // ETHERS.JS: await contract.removeFunds(dependentAddress, amount)
    function removeFunds(address _dependent, uint _amount) external {
        require(guardianOf[_dependent] == msg.sender, "No sos el guardian");
        require(dependents[_dependent].balance >= _amount, "Saldo insuficiente");

        dependents[_dependent].balance -= _amount;
        usdt.transfer(msg.sender, _amount);
    }

    // Guardian elimina un dependiente
    // ETHERS.JS: await contract.removeDependent(dependentAddress)
    function removeDependent(address _dependent) external {
        require(guardianOf[_dependent] == msg.sender, "No sos el guardian");

        dependents[_dependent].active = false;
        emit DependentRemoved(_dependent);
    }

    // Guardian aprueba un pedido de más plata
    // ETHERS.JS: await contract.approveRequest(requestId)
    function approveRequest(uint _requestId) external {
        Request storage req = requests[_requestId];
        require(req.pending, "No esta pendiente");
        require(guardianOf[req.dependent] == msg.sender, "No sos el guardian");

        req.pending = false;
        dependents[req.dependent].balance += req.amount;

        emit RequestApproved(_requestId);
    }


    // ================================================================
    // FUNCIONES DEL DEPENDIENTE
    // ================================================================

    // Dependiente realiza un gasto
    // Si no tiene saldo emite InsufficientFunds y NO revierte (para que el frontend maneje el cartel)
    // ETHERS.JS: await contract.spend(10_000_000, "Supermercado")
    // Nota: 10_000_000 = 10 USDT
    function spend(uint _amount, string calldata _description) external {
        Dependent storage dep = dependents[msg.sender];
        require(dep.active, "Cuenta no activa");
        require(_amount > 0, "Monto invalido");

        // Si no alcanza la plata, emitimos evento y salimos sin revertir
        // ETHERS.JS: escuchar evento InsufficientFunds para mostrar cartel y botón "pedir más"
        if (_amount > dep.balance) {
            emit InsufficientFunds(msg.sender, _amount, dep.balance);
            return;
        }

        // Calcular fee
        uint fee = (_amount * LATIGO_FEE) / 10_000;
        uint amountAfterFee = _amount - fee;

        dep.balance -= _amount;

        // Transferir plata al dependiente descontando el fee
        // y pagar a latido
        usdt.transfer(msg.sender, amountAfterFee);
        usdt.transfer(feeRecipient, fee);

        // Guardar en historial
        paymentHistory[msg.sender].push(Payment({
            amount: _amount,
            description: _description,
            timestamp: block.timestamp
        }));

        emit Spent(msg.sender, _amount, _description);
    }

    // Dependiente pide más plata al guardian con un motivo
    // ETHERS.JS: await contract.requestMore(50_000_000, "Gastos médicos")
    function requestMore(uint _amount, string calldata _reason) external {
        require(dependents[msg.sender].active, "Cuenta no activa");
        require(_amount > 0, "Monto invalido");

        address guardian = guardianOf[msg.sender];

        requests[requestCount] = Request({
            dependent: msg.sender,
            amount: _amount,
            reason: _reason,
            pending: true
        });

        guardianRequests[guardian].push(requestCount);
        requestCount++;

        emit RequestCreated(msg.sender, _amount, _reason);
    }


    // ================================================================
    // FUNCIONES DE LECTURA (no cuestan gas, solo consultan)
    // ================================================================

    // Saldo disponible del dependiente
    // ETHERS.JS: await contract.availableBalance(dependentAddress)
    function availableBalance(address _dependent) external view returns (uint) {
        return dependents[_dependent].balance;
    }

    // Historial completo de pagos de un dependiente
    // ETHERS.JS: await contract.getPaymentHistory(dependentAddress)
    function getPaymentHistory(address _dependent) external view returns (Payment[] memory) {
        return paymentHistory[_dependent];
    }

    // IDs de requests para un guardian
    // ETHERS.JS: await contract.getPendingRequests(guardianAddress)
    function getPendingRequests(address _guardian) external view returns (uint[] memory) {
        return guardianRequests[_guardian];
    }

    // Lista de dependientes de un guardian
    // ETHERS.JS: await contract.getDependents(guardianAddress)
    function getDependents(address _guardian) external view returns (address[] memory) {
        return guardianDependents[_guardian];
    }
}