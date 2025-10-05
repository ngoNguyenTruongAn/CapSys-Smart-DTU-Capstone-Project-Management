
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Proposals from './pages/admin/Proposals'
import Proposaldetail from './features/proposals/proposal-detail-UI/Proposal-detail';

function App() {
  

  return (
     <BrowserRouter>
      <Routes>
        <Route path="/proposals" element={<Proposals />} />
         <Route path="/proposal-detail/:id" element={<Proposaldetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
