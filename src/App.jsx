
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Proposals from './pages/admin/Proposals'


function App() {
  

  return (
     <BrowserRouter>
      <Routes>
        <Route path="/proposals" element={<Proposals />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
