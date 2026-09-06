import DashboardController from './DashboardController'
import SupplierController from './SupplierController'
import InventoryController from './InventoryController'
import UserController from './UserController'
import ReportController from './ReportController'
import SettingController from './SettingController'

const Admin = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    SupplierController: Object.assign(SupplierController, SupplierController),
    InventoryController: Object.assign(InventoryController, InventoryController),
    UserController: Object.assign(UserController, UserController),
    ReportController: Object.assign(ReportController, ReportController),
    SettingController: Object.assign(SettingController, SettingController),
}

export default Admin