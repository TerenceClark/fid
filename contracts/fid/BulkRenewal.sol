// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;
pragma experimental ABIEncoderV2;

import "./FID.sol";
import "./RegistrarController.sol";
import "./resolver/Resolver.sol";

contract BulkRenewal {
    bytes4 constant private REGISTRAR_CONTROLLER_ID = 0x018fac06;
    bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant public BULK_RENEWAL_ID = bytes4(
        keccak256("rentPrice(string[],uint)") ^
        keccak256("renewAll(string[],uint")
    );

    bytes32 public domainNameHash;
    FID public fid;

    constructor(FID _fid, bytes32 _domainNameHash) {
        domainNameHash = _domainNameHash;
        fid = _fid;
    }

    function getController() internal view returns(RegistrarController) {
        Resolver r = Resolver(fid.resolver(domainNameHash));
        return RegistrarController(r.interfaceImplementer(domainNameHash, REGISTRAR_CONTROLLER_ID));
    }

    function rentPrice(string[] calldata names, uint duration) external view returns(uint total) {
        RegistrarController controller = getController();
        for(uint i = 0; i < names.length; i++) {
            total += controller.rentPrice(names[i], duration);
        }
    }

    function renewAll(string[] calldata names, uint duration) external {
        RegistrarController controller = getController();
        for(uint i = 0; i < names.length; i++) {
            // uint cost = controller.rentPrice(names[i], duration);
            controller.renew(names[i], duration);
        }
    }

    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
         return interfaceID == INTERFACE_META_ID || interfaceID == BULK_RENEWAL_ID;
    }
}
