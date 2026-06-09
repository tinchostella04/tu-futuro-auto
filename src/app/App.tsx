import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from './routes'
import Home from './components/Home'
import Vehicles from './components/Vehicles'
import PublishForm from './components/PublishForm'
import Admin from './components/Admin'
import CreateVehicle from './components/CreateVehicle'
import PaymentSuccess from './components/PaymentSuccess'
import PaymentFailed from './components/PaymentFailed'
import PaymentPending from './components/PaymentPending'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.VEHICLES} element={<Vehicles />} />
        <Route path={ROUTES.PUBLISH} element={<PublishForm />} />
        <Route path={ROUTES.ADMIN} element={<Admin />} />
        <Route path={ROUTES.CREATE_VEHICLE} element={<CreateVehicle />} />
        <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
        <Route path={ROUTES.PAYMENT_FAILED} element={<PaymentFailed />} />
        <Route path={ROUTES.PAYMENT_PENDING} element={<PaymentPending />} />
      </Routes>
    </BrowserRouter>
  )
}
