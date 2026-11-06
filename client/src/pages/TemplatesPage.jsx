import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTemplate } from '../context/TemplateContext';
import { useCredential } from '../context/CredentialContext';
import { useContact } from '../context/ContactContext'
import { useGroup } from '../context/GroupContext';
import LoaderGeneral from '../components/LoaderGeneral';
import SendSummaryModal from '../components/SendSummaryModal';

// Opción especial para usar el nombre del contacto como variable de la plantilla.
const NAME_KEY = '__name__';

function TemplatesPage() {
    const { user } = useAuth();
    const { getCredentialsByUserId } = useCredential();
    const { sendMessagesByTemplate } = useTemplate();
    const { getContactsByGroup, filteredContacts } = useContact();
    const [destinationGroup, setDestinationGroup] = useState('');
    const { groups, getGroups } = useGroup('');
    const [wabId, setWabId] = useState('');
    const [tokenAccess, setTokenAccess] = useState('');
    const [phoneId, setPhoneId] = useState('');
    const [selectedOption_NameTemplate, setSelectedOption_NameTemplate] = useState('');
    const { templates, getTemplates, setTemplates } = useTemplate();
    const [executionTime, setExecutionTime] = useState(30);
    const [executionUnit, setExecutionUnit] = useState('horas');
    const [headerContent, setHeaderContent] = useState('Contenido de muestra, no será editable.');
    const [headerExamples, setHeaderExamples] = useState('Rubén || 300 puntos');
    const [bodyContent, setBodyContent] = useState('Contenido de muestra, no será editable.');
    const [bodyExamples, setBodyExamples] = useState('Rubén || 300 puntos');
    const [footerContent, setFooterContent] = useState('Contenido de muestra, no será editable.');
    const [footerExamples, setFooterExamples] = useState('Rubén || 300 puntos');
    const [buttonText, setButtonText] = useState('Contenido de muestra, no será editable.');
    const [buttonContent, setButtonContent] = useState('Contenido de muestra, no será editable.');
    const [buttonExamples, setButtonExamples] = useState('Rubén || 300 puntos');
    const [isGroupSelectEnabled, setIsGroupSelectEnabled] = useState(false);
    const [isSelectTemplate, setIsSelectTemplate] = useState(true);
    const [isSendButtonEnabled, setIsSendButtonEnabled] = useState(false);
    const [isHeaderValuesEditable, setHeaderValuesEditable] = useState(false);
    const [isBodyValuesEditable, setBodyValuesEditable] = useState(false);
    const [isFooterValuesEditable, setFooterValuesEditable] = useState(false);
    const [isButtonValuesEditable, setButtonValuesEditable] = useState(false);
    const [templateDataFilter, setTemplateDataFilter] = useState([]);
    const [selectedHeaderKeys, setSelectedHeaderKeys] = useState([]);
    const [selectedBodyKeys, setSelectedBodyKeys] = useState([]);
    const [selectedButtonKeys, setSelectedButtonKeys] = useState([]);
    const [numbers, setNumbers] = useState([]);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sendResults, setSendResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, total: 0 });

    // Campos disponibles para las variables: el nombre + todas las columnas extra de los contactos del grupo.
    const variableKeys = useMemo(() => {
        const keys = new Set();
        filteredContacts.forEach(contact => Object.keys(contact.variables || {}).forEach(key => keys.add(key)));
        return [...keys];
    }, [filteredContacts]);

    const renderVariableOptions = () => (
        <>
            <option value="">Selecciona un campo</option>
            <option value={NAME_KEY}>Nombre del contacto</option>
            {variableKeys.map(key => (
                <option key={key} value={key}>{key}</option>
            ))}
        </>
    );


    const extractDynamicVariables = (content) => {
        const regex = /\{\{\d+\}\}/g;
        return content.match(regex) || [];
    };

    const dynamicVariablesHeaderSelect = extractDynamicVariables(headerContent);
    const dynamicVariablesBodySelect = extractDynamicVariables(bodyContent);
    const dynamicVariablesButtonSelect = extractDynamicVariables(buttonContent);

    const handleSelectHeaderChange = (value, index) => {
        const newSelectedKeysHeader = [...selectedHeaderKeys];
        newSelectedKeysHeader[index] = value;
        setSelectedHeaderKeys(newSelectedKeysHeader);
    };

    const handleSelectBodyChange = (value, index) => {
        const newSelectedKeysBody = [...selectedBodyKeys];
        newSelectedKeysBody[index] = value;
        setSelectedBodyKeys(newSelectedKeysBody);
    };

    const handleSelectButtonChange = (value, index) => {
        const newSelectedKeysButton = [...selectedButtonKeys];
        newSelectedKeysButton[index] = value;
        setSelectedButtonKeys(newSelectedKeysButton);
    };

    useEffect(() => {
        setTemplates([]);
        getGroups();
        const loadCredential = async () => {
            const fetchedCredentials = await getCredentialsByUserId(user.id);
            if (fetchedCredentials.length > 0) {
                const fetchedCredential = fetchedCredentials[0]; // Accede al primer elemento del array
                setWabId(fetchedCredential.wabId || '');
                setTokenAccess(fetchedCredential.tokenAccess || '');
                setPhoneId(fetchedCredential.phoneId || '');
            }
        }
        loadCredential();
    }, [user.id, getCredentialsByUserId, setTemplates]);  // Se ejecuta solo una vez al montar el componente

    const handleShareTemplates = async () => {
        setLoadingRefresh(true);
        setErrorMessage('');
        try {
            const error = await getTemplates();
            if (error) setErrorMessage(error);
            setIsSendButtonEnabled(false); // Desactiva el botón de enviar mensaje al refrescar
        } catch (error) {

        } finally {
            setLoadingRefresh(false);
        }

        // Restablecer todos los estados a sus valores iniciales
        setExecutionTime(30);
        setExecutionUnit('horas');
        setHeaderContent('Contenido de muestra, no será editable.');
        setHeaderExamples('Rubén || 300 puntos');
        setBodyContent('Contenido de muestra, no será editable.');
        setBodyExamples('Rubén || 300 puntos');
        setFooterContent('Contenido de muestra, no será editable.');
        setFooterExamples('Rubén || 300 puntos');
        setButtonText('Contenido de muestra, no será editable.');
        setButtonContent('Contenido de muestra, no será editable.');
        setButtonExamples('Rubén || 300 puntos');

        // Restablecer el select y desactivar los botones y el select
        setDestinationGroup(''); // Asegúrate de que esto coincida con la opción inicial en tu select
        setIsSelectTemplate('');
        setSelectedHeaderKeys('');
        setSelectedBodyKeys('');
        setSelectedButtonKeys('');

        setIsSendButtonEnabled(false);
        setSelectedOption_NameTemplate('');
        setIsSelectTemplate(true);
        setIsGroupSelectEnabled(false);
    };

    const handleSelectionChange = (e) => {
        // Aquí se maneja lógica para manejar el cambio de selección
        const selectedOption = e.target.value;
        setSelectedOption_NameTemplate(selectedOption);
        setIsSelectTemplate(selectedOption === '');
        setIsSendButtonEnabled(false); // Desactiva el botón de enviar mensaje al cambiar la plantilla
    };

    const handleShareTemplateComponents = async () => {
        setLoadingData(true);
        try {
            setIsGroupSelectEnabled(true);
            if (isSelectTemplate) {
                setIsSendButtonEnabled(false); // Desactiva el botón de enviar mensaje si no se ha seleccionado una plantilla
                return;
            }

            // Filtra los datos directamente sin usar el estado templateDataFilter
            const selectedTemplate = templates[Number(selectedOption_NameTemplate)];
            const getTemplateData = selectedTemplate ? [selectedTemplate] : [];
            console.log(getTemplateData);
            setTemplateDataFilter(getTemplateData);

            if (getTemplateData.length === 0) {
                console.error('No se encontró la plantilla seleccionada.');
                return;
            }

            const components = getTemplateData[0].components;

            // Filtrar componentes según el tipo
            const headerTemplate = components.find(component => component.type === 'HEADER');
            const bodyTemplate = components.find(component => component.type === 'BODY');
            const footerTemplate = components.find(component => component.type === 'FOOTER');
            const buttonsTemplate = components.find(component => component.type === 'BUTTONS');

            const joinWithSeparator = (values) => Array.isArray(values) ? values.join(' || ') : values;

            /*---------------------------------------------------------------------------------------------------*/
            /*---------------------------------------------HEADER------------------------------------------------*/
            if (headerTemplate !== undefined) {
                if (headerTemplate.format === 'IMAGE') {
                    setHeaderContent('No tiene texto, solo imagen.');
                    if (headerTemplate.example !== undefined) {
                        if (headerTemplate.example.header_handle !== undefined) {
                            setHeaderExamples(joinWithSeparator(headerTemplate.example.header_handle));
                        } else {
                            setHeaderExamples('No tiene ejemplos.');
                        }
                    } else {
                        setHeaderExamples('No tiene ejemplos.');
                    }
                } else if (headerTemplate.format === 'TEXT') {
                    if (headerTemplate.text !== undefined) {
                        setHeaderContent(headerTemplate.text);
                    } else {
                        setHeaderContent('No tiene texto.');
                    }
                    if (headerTemplate.example !== undefined) {
                        if (headerTemplate.example.header_text !== undefined) {
                            setHeaderExamples(joinWithSeparator(headerTemplate.example.header_text));
                        } else {
                            setHeaderExamples('No tiene ejemplos.');
                        }
                    } else {
                        setHeaderExamples('No tiene ejemplos.');
                    }
                } else {
                    // Otros formatos
                }
                // Evaluar si el contenido tiene variables dinámicas
                const hasDynamicVariablesHeader = /{{\d+}}/.test(headerTemplate.text || '');
                setHeaderValuesEditable(hasDynamicVariablesHeader);
            } else {
                setHeaderContent('No tiene header.');
                setHeaderExamples('No tiene header.');
                setHeaderValuesEditable(false);
            }
            /*---------------------------------------------------------------------------------------------------*/
            /*---------------------------------------------BODY--------------------------------------------------*/
            if (bodyTemplate !== undefined) {
                if (bodyTemplate.text !== undefined) {
                    setBodyContent(bodyTemplate.text);
                } else {
                    setBodyContent('No tiene texto.');
                }
                if (bodyTemplate.example !== undefined) {
                    if (bodyTemplate.example.body_text !== undefined) {
                        setBodyExamples(joinWithSeparator(bodyTemplate.example.body_text.map(example => joinWithSeparator(example))));
                    } else {
                        setBodyExamples('No tiene ejemplos.');
                    }
                } else {
                    setBodyExamples('No tiene ejemplos.');
                }
                // Evaluar si el contenido tiene variables dinámicas
                const hasDynamicVariablesBody = /{{\d+}}/.test(bodyTemplate.text || '');
                setBodyValuesEditable(hasDynamicVariablesBody);
            } else {
                setBodyContent('No tiene body.');
                setBodyExamples('No tiene body.');
                setBodyValuesEditable(false);
            }
            /*---------------------------------------------------------------------------------------------------*/
            /*---------------------------------------------FOOTER------------------------------------------------*/
            if (footerTemplate !== undefined) {
                if (footerTemplate.text !== undefined) {
                    setFooterContent(footerTemplate.text);
                } else {
                    setFooterContent('No tiene texto.');
                }
                if (footerTemplate.example !== undefined) {
                    if (footerTemplate.example.footer_text !== undefined) {
                        setFooterExamples(joinWithSeparator(footerTemplate.example.footer_text));
                    } else {
                        setFooterExamples('No tiene ejemplos.');
                    }
                } else {
                    setFooterExamples('No tiene ejemplos.');
                }
                // Evaluar si el contenido tiene variables dinámicas
                const hasDynamicVariablesFooter = /{{\d+}}/.test(footerTemplate.text || '');
                setFooterValuesEditable(hasDynamicVariablesFooter);
            } else {
                setFooterContent('No tiene footer.');
                setFooterExamples('No tiene footer.');
                setFooterValuesEditable(false);
            }
            /*---------------------------------------------------------------------------------------------------*/
            /*---------------------------------------------BUTTONS-----------------------------------------------*/
            if (buttonsTemplate !== undefined) {
                if (buttonsTemplate.buttons !== undefined && buttonsTemplate.buttons.length > 0) {
                    const buttonText = joinWithSeparator(buttonsTemplate.buttons.map(button => button.text));
                    const buttonTextContent = joinWithSeparator(buttonsTemplate.buttons.map(button => button.url));
                    const buttonUrls = joinWithSeparator(buttonsTemplate.buttons
                        .filter(button => button.example !== undefined)
                        .map(button => button.example));
                    setButtonText(buttonText || 'No tiene texto.');
                    setButtonContent(buttonTextContent || 'No tiene url.');
                    setButtonExamples(buttonUrls || 'No tiene ejemplos.');
                    // Evaluar si el contenido tiene variables dinámicas
                    const hasDynamicVariablesButtons = buttonsTemplate.buttons.some(button => /{{\d+}}/.test(button.url));
                    setButtonValuesEditable(hasDynamicVariablesButtons);
                } else {
                    setButtonText('No tiene texto.');
                    setButtonContent('No tiene texto.');
                    setButtonExamples('No tiene ejemplos ni url.');
                    setButtonValuesEditable(false);
                }
            } else {
                setButtonText('No tiene buttons.');
                setButtonContent('No tiene buttons.');
                setButtonExamples('No tiene buttons.');
                setButtonValuesEditable(false);
            }
        } catch (error) {

        } finally {
            setLoadingData(false);
        }
    };
    /*------------------------------------------------------------------------------------------------------*/
    /*--------------------------------------ENVIAR DE MENSAJES----------------------------------------------*/
    const sanitizeVariables = (selectedKeys = [], contact) => {
        // Asegúrate de que selectedKeys sea un array, incluso si no se pasa
        if (!Array.isArray(selectedKeys)) {
            console.error('selectedKeys debe ser un array. Valor recibido:', selectedKeys);
            return []; // O maneja el error según lo que necesites
        }
        // Mapear las claves seleccionadas a sus valores correspondientes y devolverlos como un arreglo
        return selectedKeys.map(key => key === NAME_KEY ? (contact.name || '') : (contact.variables?.[key] || ''));
    };    

    const createPayloadData = (template, contacts, selectedHeaderKeys, selectedBodyKeys, selectedButtonKeys) => {
        let parsedTemplate;

        try {
            if (Array.isArray(template) && template.length > 0) {
                parsedTemplate = template[0];
            } else if (typeof template === 'object' && template !== null) {
                parsedTemplate = template;
            } else {
                throw new Error('El template debe ser un objeto');
            }

            if (!parsedTemplate.components || !Array.isArray(parsedTemplate.components)) {
                throw new Error('El template debe contener una propiedad "components" que sea un array');
            }
        } catch (error) {
            console.error('Error al procesar template:', error.message);
            return;
        }

        // Construye la lista de destinatarios asignando las variables correspondientes a cada uno
        const recipientList = contacts.map(contact => ({
            number: contact.phoneNumber,
            variables: {
                header: sanitizeVariables(selectedHeaderKeys, contact),
                body: sanitizeVariables(selectedBodyKeys, contact),
                buttons: sanitizeVariables(selectedButtonKeys, contact),
            }
        }));

        return {
            template: parsedTemplate,
            recipientList
        };
    };

    const handleSendTemplates = async () => {
        setErrorMessage('');

        if (filteredContacts.length === 0) {
            setErrorMessage('El grupo seleccionado no tiene contactos.');
            return;
        }

        // Cada variable {{n}} de la plantilla debe tener un campo asignado.
        const isMissing = (variables, keys) => variables.some((_, i) => !(Array.isArray(keys) && keys[i]));
        if (isMissing(dynamicVariablesHeaderSelect, selectedHeaderKeys) ||
            isMissing(dynamicVariablesBodySelect, selectedBodyKeys) ||
            isMissing(dynamicVariablesButtonSelect, selectedButtonKeys)) {
            setErrorMessage('Asigna un campo a cada variable {{n}} de la plantilla antes de enviar.');
            return;
        }

        const data = createPayloadData(templateDataFilter, filteredContacts, selectedHeaderKeys, selectedBodyKeys, selectedButtonKeys);
        if (!data) {
            setErrorMessage('No se pudo preparar la plantilla seleccionada.');
            return;
        }

        if (!window.confirm(`Se enviará la plantilla "${data.template.name}" a ${data.recipientList.length} contacto(s). ¿Continuar?`)) {
            return;
        }

        setSending(true);
        setProgress({ sent: 0, total: data.recipientList.length });
        try {
            const response = await sendMessagesByTemplate(data, (sent, total) => setProgress({ sent, total }));
            setSendResults(response.results);
        } catch (error) {
            console.error('Error al enviar mensajes:', error);
            setErrorMessage('Ocurrió un error al enviar los mensajes.');
        } finally {
            setSending(false);
        }

        // Abre el modal después de que el estado esté actualizado
        setIsModalOpen(true);

        // Restablecer todos los estados a sus valores iniciales
        setExecutionTime(30);
        setExecutionUnit('horas');
        setHeaderContent('Contenido de muestra, no será editable.');
        setHeaderExamples('Rubén || 300 puntos');
        setBodyContent('Contenido de muestra, no será editable.');
        setBodyExamples('Rubén || 300 puntos');
        setFooterContent('Contenido de muestra, no será editable.');
        setFooterExamples('Rubén || 300 puntos');
        setButtonText('Contenido de muestra, no será editable.');
        setButtonContent('Contenido de muestra, no será editable.');
        setButtonExamples('Rubén || 300 puntos');

        // Restablecer el select y desactivar los botones y el select
        setDestinationGroup(''); // Asegúrate de que esto coincida con la opción inicial en tu select
        setIsSelectTemplate('');
        setSelectedHeaderKeys('');
        setSelectedBodyKeys('');
        setSelectedButtonKeys('');
        setNumbers([]);

        setIsSendButtonEnabled(false);
        setSelectedOption_NameTemplate('');
        setIsSelectTemplate(true);
        setIsGroupSelectEnabled(false);
    };

    /*------------------------------------------------------------------------------------------------------*/
    /*---------------------------------------------OTROS----------------------------------------------------*/
    const handleExecutionTimeChange = (e) => setExecutionTime(e.target.value);
    const handleExecutionUnitChange = (e) => setExecutionUnit(e.target.value);
    const handleDestinationGroupChange = async (event) => {
        setDestinationGroup(event.target.value);
        await getContactsByGroup(event.target.value);
    };

    // Efecto para obtener los números de teléfono una vez que se actualice filteredContacts
    useEffect(() => {
        const loadNumbers = async () => {
            const fetchedNumbers = filteredContacts.map(contact => contact.phoneNumber);
            setNumbers(fetchedNumbers);
        };

        loadNumbers();
    }, [filteredContacts]);

    const handleHeaderContentChange = (e) => {
        const content = e.target.value;
        setHeaderContent(content);
        // Evaluar si el contenido tiene variables dinámicas
        const hasDynamicVariables = /{{\d+}}/.test(content);
        setHeaderValuesEditable(hasDynamicVariables);
    };
    const handleHeaderExamplesChange = (e) => setHeaderExamples(e.target.value);

    const handleBodyContentChange = (e) => {
        const content = e.target.value;
        setBodyContent(content);
        const hasDynamicVariables = /{{\d+}}/.test(content);
        setBodyValuesEditable(hasDynamicVariables);
    };
    const handleBodyExamplesChange = (e) => setBodyExamples(e.target.value);
    const handleFooterContentChange = (e) => {
        const content = e.target.value;
        setFooterContent(content);
        const hasDynamicVariables = /{{\d+}}/.test(content);
        setFooterValuesEditable(hasDynamicVariables);
    };
    const handleFooterExamplesChange = (e) => setFooterExamples(e.target.value);
    const handleButtonTextChange = (e) => setButtonText(e.target.value);
    const handleButtonContentChange = (e) => {
        const content = e.target.value;
        setButtonContent(content);
        const hasDynamicVariables = /{{\d+}}/.test(content);
        setButtonValuesEditable(hasDynamicVariables);
    };
    const handleButtonExamplesChange = (e) => setButtonExamples(e.target.value);

    return (
        <>
            <div className="lg:flex lg:items-center lg:justify-between h-auto max-h-screen">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-[#F2F2DC] sm:truncate sm:text-3xl sm:tracking-tight">
                        Plantillas
                    </h2>
                    <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-[#7A7A7A]">
                            Hola {user.firstName} {user.lastName}, en esta sección puedes visualizar las plantillas activas, como también programar su funcionamiento.
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex flex-col md:flex-row md:space-x-4">
                    <button
                        type="button"
                        className="mb-3 md:mb-0 inline-flex lg:w-[200px] items-center justify-center rounded-md bg-[#6D28D9] px-3 py-2 text-md font-semibold text-white shadow-sm hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full"
                        onClick={handleShareTemplates}
                        disabled={loadingRefresh}
                    >
                        {loadingRefresh ? 'Cargando...' : <span>Refrescar</span>}
                    </button>
                    {loadingRefresh && <LoaderGeneral />}

                    <button
                        type="button"
                        className={`mb-3 md:mb-0 inline-flex lg:w-[200px] items-center justify-center rounded-md bg-[#6D28D9] px-3 py-2 text-md font-semibold text-white shadow-sm hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${!isSendButtonEnabled ? 'opacity-50 cursor-not-allowed' : ''} w-full`}
                        onClick={handleSendTemplates}
                        disabled={!isSendButtonEnabled || sending}
                    >
                        <span>{sending ? `Enviando ${progress.sent}/${progress.total}...` : 'Enviar Mensaje'}</span>
                    </button>
                    <SendSummaryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        sendResults={sendResults} // Asegúrate de pasar sendResults como prop
                    />
                </div>
            </div>

            {errorMessage && (
                <div className="mt-4 bg-red-500 text-white p-3 rounded-md">
                    {errorMessage}
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 pt-6">
                <div className="bg-[#141414] p-4 rounded-lg flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl">Selección de plantilla</h2>
                        <button
                            className={`inline-flex items-center justify-center rounded-md bg-[#6D28D9] px-3 py-2 text-md font-semibold text-white shadow-sm hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isSelectTemplate || loadingData ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleShareTemplateComponents}
                            disabled={isSelectTemplate || loadingData} // Desactiva el botón si no se ha seleccionado una plantilla o si está cargando
                        >
                            {loadingData ? 'Cargando...' : 'Cargar Datos'}
                        </button>
                        {loadingData && <LoaderGeneral />}
                    </div>
                    <div>
                        <label className="block text-white">Plantilla</label>
                        <select
                            className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                            value={selectedOption_NameTemplate}
                            onChange={handleSelectionChange}
                        >
                            <option value="">Selecciona una plantilla</option>
                            {templates.map((template, index) => (
                                <option key={index} value={index}>{template.name} ({template.language})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-[#141414] p-4 rounded-lg flex-1">
                    <h2 className="text-xl mb-2">Ejecución y destino</h2>
                    <div>
                        <label>El envío de mensajes masivos será ejecutado cada</label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                className="bg-[#F2F2DC] text-[#333333] p-2 rounded w-16 mr-2"
                                value={executionTime}
                                onChange={handleExecutionTimeChange}
                            />
                            <select
                                className="w-max bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={executionUnit}
                                onChange={handleExecutionUnitChange}
                            >
                                <option>horas</option>
                                <option>minutos</option>
                                <option>segundos</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-2">
                        <label>Grupo seleccionado para el destino de los mensajes:</label>
                        <select
                            className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                            value={destinationGroup}
                            onChange={(e) => {
                                handleDestinationGroupChange(e);
                                setIsSendButtonEnabled(e.target.value !== '');
                            }}
                            disabled={!isGroupSelectEnabled}
                        >
                            <option value="">Selecciona un grupo</option>
                            {groups.length > 0 ? (
                                groups.map((group, index) => (
                                    <option key={index} value={group._id}>
                                        {group.groupName}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No hay grupos disponibles</option>
                            )}
                        </select>
                        {destinationGroup && (
                            <p className="text-sm text-[#7A7A7A] mt-1">{filteredContacts.length} contacto(s) en el grupo</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-[#141414] p-4 rounded-lg">
                <h2 className="text-xl mb-4">Previsualización</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/*-------------------------------------------------------HEADER----------------------------------------------------------- */}

                    <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-lg mb-2">HEADER</h3>
                        <div className="mb-2">
                            <label>Contenido</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={headerContent}
                                onChange={handleHeaderContentChange}
                                disabled
                            />
                        </div>
                        <div className="mb-2">
                            <label>Ejemplos</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={headerExamples}
                                onChange={handleHeaderExamplesChange}
                                disabled
                            />
                        </div>
                        {/*-------------------------------------------------PRUEBA DE ENCABEZADOS----------------------------------------------------- */}
                        {dynamicVariablesHeaderSelect.length > 0 && (
                            <div>
                                {dynamicVariablesHeaderSelect.map((variable, index) => (
                                    <div key={index} className="mt-2">
                                        <label>Campo a elegir para {variable}:</label>
                                        <select
                                            className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                            value={selectedHeaderKeys[index] || ''}
                                            onChange={(e) => handleSelectHeaderChange(e.target.value, index)}
                                        >
                                            {renderVariableOptions()}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/*-------------------------------------------------------BODY----------------------------------------------------------- */}

                    <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-lg mb-2">BODY</h3>
                        <div className="mb-2">
                            <label>Contenido</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={bodyContent}
                                onChange={handleBodyContentChange}
                                disabled
                            />
                        </div>
                        <div className="mb-2">
                            <label>Ejemplos</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={bodyExamples}
                                onChange={handleBodyExamplesChange}
                                disabled
                            />
                        </div>
                        {/*-------------------------------------------------PRUEBA DE ENCABEZADOS----------------------------------------------------- */}
                        {dynamicVariablesBodySelect.length > 0 && (
                            <div>
                                {dynamicVariablesBodySelect.map((variable, index) => (
                                    <div key={index} className="mt-2">
                                        <label>Campo a elegir para {variable}:</label>
                                        <select
                                            className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                            value={selectedBodyKeys[index] || ''}
                                            onChange={(e) => handleSelectBodyChange(e.target.value, index)}
                                        >
                                            {renderVariableOptions()}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/*-------------------------------------------------------FOOTER----------------------------------------------------------- */}

                    <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-lg mb-2">FOOTER</h3>
                        <div className="mb-2">
                            <label>Contenido</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={footerContent}
                                onChange={handleFooterContentChange}
                                disabled
                            />
                        </div>
                        <div className="mb-2">
                            <label>Ejemplos</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={footerExamples}
                                onChange={handleFooterExamplesChange}
                                disabled
                            />
                        </div>
                    </div>

                    {/*-------------------------------------------------------BUTTONS----------------------------------------------------------- */}

                    <div className="bg-[#262626] p-4 rounded-lg">
                        <h3 className="text-lg mb-2">BUTTON</h3>
                        <div className="mb-2">
                            <label>Texto en botón</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={buttonText}
                                onChange={handleButtonTextChange}
                                disabled
                            />
                        </div>
                        <div className="mb-2">
                            <label>Contenido</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={buttonContent}
                                onChange={handleButtonContentChange}
                                disabled
                            />
                        </div>
                        <div className="mb-2">
                            <label>Ejemplos</label>
                            <input
                                type="text"
                                className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                value={buttonExamples}
                                onChange={handleButtonExamplesChange}
                                disabled
                            />
                        </div>
                        {/*-------------------------------------------------PRUEBA DE ENCABEZADOS----------------------------------------------------- */}
                        {dynamicVariablesButtonSelect.length > 0 && (
                            <div>
                                {dynamicVariablesButtonSelect.map((variable, index) => (
                                    <div key={index} className="mt-2">
                                        <label>Campo a elegir para {variable}:</label>
                                        <select
                                            className="w-full bg-[#F2F2DC] text-[#333333] p-2 rounded"
                                            value={selectedButtonKeys[index] || ''}
                                            onChange={(e) => handleSelectButtonChange(e.target.value, index)}
                                        >
                                            {renderVariableOptions()}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default TemplatesPage;