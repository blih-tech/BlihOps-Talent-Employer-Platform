"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCategoryLabels = exports.ServiceCategory = void 0;
/**
 * Service categories supported by BlihOps
 */
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["ITO"] = "ITO";
    ServiceCategory["AI"] = "AI";
    ServiceCategory["AUTOMATION"] = "AUTOMATION";
    ServiceCategory["DATA_ANALYTICS"] = "DATA_ANALYTICS";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
/**
 * Service category display names
 */
exports.ServiceCategoryLabels = {
    [ServiceCategory.ITO]: 'Information Technology Outsourcing',
    [ServiceCategory.AI]: 'AI & Intelligent Solutions',
    [ServiceCategory.AUTOMATION]: 'Business Automation Services',
    [ServiceCategory.DATA_ANALYTICS]: 'Data & Analytics Services',
};
//# sourceMappingURL=service-category.constants.js.map