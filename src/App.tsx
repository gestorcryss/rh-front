import { BrowserRouter as Router, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// Layout
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas EXISTENTES (mantidas)
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import Home from "./pages/Dashboard/Home";
import FuncionariosList from "./pages/Funcionarios/List";
import CreateFuncionario from "./pages/Funcionarios/Create";
import EditFuncionario from "./pages/Funcionarios/Edit";

import ContratosList from "./pages/Contratos/List";
import CreateContrato from "./pages/Contratos/Create";
import ContratosAllList from "./pages/Contratos/AllList";
import CreateContratoGlobal from "./pages/Contratos/CreateGlobal";
import EditContrato from "./pages/Contratos/Edit";
import ShowContrato from "./pages/Contratos/Show";
import ShowFuncionario from "./pages/Funcionarios/Show";
import { RubricaForm, RubricasList, RubricaVersoes } from "./pages/Rubricas";
import RegrasFiscais from "./pages/Rubricas/RegrasFiscais";


// ============================================================
// NOVAS PÁGINAS - SISTEMA DE RH E FOLHA DE PAGAMENTO
// (Serão criadas gradualmente)
// ============================================================

/* Temporariamente, vamos usar páginas placeholder
import FuncionariosList from "./pages/Funcionarios/ListPlaceholder";
*/
// Query Client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Rotas Protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />

            {/* Funcionários */}
            <Route path="/funcionarios" element={<FuncionariosList />} />
            <Route path="/funcionarios/novo" element={<CreateFuncionario />} />
            <Route path="/funcionarios/:id/editar" element={<EditFuncionario />} />
            <Route path="/funcionarios/:id" element={<ShowFuncionario />} />
            {/*
              <Route path="/funcionarios/dados-pessoais" element={<FuncionariosList />} />
*/}
            {/* Contratos */}
            <Route path="/contratos" element={<ContratosAllList />} />
            <Route path="/contratos/novo" element={<CreateContratoGlobal />} />
            <Route path="/funcionarios/:funcionarioId/contratos" element={<ContratosList />} />
            <Route path="/funcionarios/:funcionarioId/contratos/novo" element={<CreateContrato />} />
            <Route path="/contratos/:contratoId" element={<ShowContrato />} />
            <Route path="/contratos/:contratoId/editar" element={<EditContrato />} />
            {/* Páginas EXISTENTES (mantidas) */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            {/* Rubricas */}
            <Route path="rubricas">
              <Route index element={<RubricasList />} />
              <Route path="novo" element={<RubricaForm />} />
              <Route path=":id/editar" element={<RubricaForm />} />
              <Route path=":id/versoes" element={<RubricaVersoes />} />
              <Route path=":id/versoes/:versaoId/regras-fiscais" element={<RegrasFiscais />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}