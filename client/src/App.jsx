import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TemplateProvider } from "./context/TemplateContext.jsx";
import { CredentialProvider } from "./context/CredentialContext.jsx";
import { ContactProvider } from "./context/ContactContext.jsx";
import { GroupProvider } from "./context/GroupContext.jsx";
import { LayoutProvider } from "./context/LayoutContext.jsx";

import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import TemplatesPage from "./pages/TemplatesPage.jsx";
import ContactsPage from "./pages/ContactsPage.jsx";
import ExecutionsPage from "./pages/ExecutionsPage.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";

function App() {
    return (
        <AuthProvider>
            <TemplateProvider>
                <CredentialProvider>
                    <ContactProvider>
                        <GroupProvider>
                            <BrowserRouter>
                                <LayoutProvider>
                                <div className="flex h-full bg-bg text-fg">
                                    <Sidebar />
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Navbar />
                                        <main className="flex-1 overflow-y-auto">
                                            <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-2 sm:px-6">
                                                <Routes>
                                                    {/* Rutas públicas */}
                                                    <Route path="/" element={<HomePage />} />
                                                    <Route path="/login" element={<LoginPage />} />
                                                    <Route path="/register" element={<RegisterPage />} />
                                                    {/* Rutas privadas (protegidas) */}
                                                    <Route element={<ProtectedRoute />}>
                                                        <Route path="/profile" element={<ProfilePage />} />
                                                        <Route path="/settings" element={<SettingsPage />} />
                                                        <Route path="/templates" element={<TemplatesPage />} />
                                                        <Route path="/contacts" element={<ContactsPage />} />
                                                        <Route path="/executions" element={<ExecutionsPage />} />
                                                        <Route path="/executions/:id" element={<ExecutionsPage />} />
                                                    </Route>
                                                    <Route path="*" element={<Navigate to="/" replace />} />
                                                </Routes>
                                            </div>
                                        </main>
                                    </div>
                                </div>
                                </LayoutProvider>
                            </BrowserRouter>
                        </GroupProvider>
                    </ContactProvider>
                </CredentialProvider>
            </TemplateProvider>
        </AuthProvider>
    );
}

export default App;
