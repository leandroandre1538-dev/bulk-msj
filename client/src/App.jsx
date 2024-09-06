import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";
import { TemplateProvider } from "./context/TemplateContext.jsx";
import { CredentialProvider } from "./context/CredentialContext.jsx";
import { ContactProvider } from "./context/ContactContext.jsx";

import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TaskPage from "./pages/TaskPage.jsx";
import TaskFormPage from "./pages/TaskFormPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import TemplatesPage from "./pages/TemplatesPage.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ContactsPage from "./pages/ContactsPage.jsx";
import { GroupProvider } from "./context/GroupContext.jsx";

function App() {
    return (
        <AuthProvider>
            <TaskProvider>
                <TemplateProvider>
                    <CredentialProvider>
                        <ContactProvider>
                            <GroupProvider>
                                <BrowserRouter>
                                    <div className="flex flex-col min-h-screen">
                                        <Navbar />
                                        <div className="flex flex-grow">
                                            <Sidebar /> {/* Barra lateral */}
                                            <main className="flex-grow p-5">
                                                <Routes>
                                                    {/* Rutas públicas */}
                                                    <Route path="/" element={<HomePage />} />
                                                    <Route path="/login" element={<LoginPage />} />
                                                    <Route path="/register" element={<RegisterPage />} />
                                                    {/* Rutas privadas (protegidas) */}
                                                    <Route element={<ProtectedRoute />}>
                                                        <Route path="/tasks" element={<TaskPage />} />
                                                        <Route path="/add-task" element={<TaskFormPage />} />
                                                        <Route path="/tasks/:id" element={<TaskFormPage />} />
                                                        <Route path="/profile" element={<ProfilePage />} />
                                                        <Route path="/settings" element={<SettingsPage />} />
                                                        <Route path="/templates" element={<TemplatesPage />} />
                                                        <Route path="/contacts" element={<ContactsPage />} />
                                                    </Route>
                                                </Routes>
                                            </main>
                                        </div>
                                    </div>
                                </BrowserRouter>
                            </GroupProvider>
                        </ContactProvider>
                    </CredentialProvider>
                </TemplateProvider>
            </TaskProvider>
        </AuthProvider>
    );
}

export default App;
