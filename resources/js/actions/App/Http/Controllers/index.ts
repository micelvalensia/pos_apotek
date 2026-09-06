import PosController from './PosController'
import Admin from './Admin'
import Settings from './Settings'

const Controllers = {
    PosController: Object.assign(PosController, PosController),
    Admin: Object.assign(Admin, Admin),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers