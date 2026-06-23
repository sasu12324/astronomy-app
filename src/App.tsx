import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { MaterialsPage } from './pages/MaterialsPage.js';
import { TextbookPage } from './pages/TextbookPage.js';
import { WheelPage } from './pages/WheelPage.js';
import { TestsManagePage } from './pages/TestsManagePage.js';
import { LobbyHostPage } from './pages/LobbyHostPage.js';
import { JoinTestPage } from './pages/JoinTestPage.js';
import { TestTakePage } from './pages/TestTakePage.js';
import { TextbookEditPage } from './pages/TextbookEditPage.js';
import { HelpPage } from './pages/HelpPage.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Публичные */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="tests/join" element={<JoinTestPage />} />
          <Route path="test/:lobbyId" element={<TestTakePage />} />

          {/* Общие */}
          <Route index element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="news" element={
            <ProtectedRoute>
              <MaterialsPage />
            </ProtectedRoute>
          } />
          <Route path="/textbook" element={<TextbookPage />} />
          <Route path="/textbook/:lectureId" element={<TextbookPage />} />

          {/* Преподаватель */}

          <Route path="/textbook/create" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TextbookEditPage />
            </ProtectedRoute>
          } />
          <Route path="/textbook/edit/:lectureId" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TextbookEditPage />
            </ProtectedRoute>
          } />

          <Route path="tests/manage" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TestsManagePage />
            </ProtectedRoute>
          } />
          <Route path="lobby/:id" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <LobbyHostPage />
            </ProtectedRoute>
          } />
          <Route path="wheel" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <WheelPage />
            </ProtectedRoute>
          } />

          {/* Учащийся */}
          {/* <Route path="tests/join" element={
            <ProtectedRoute allowedRoles={['student']}>
              <JoinTestPage />
            </ProtectedRoute>
          } />
          <Route path="test/:lobbyId" element={
            <ProtectedRoute>
              <TestTakePage />
            </ProtectedRoute>
          } /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;