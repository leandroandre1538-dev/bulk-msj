import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTemplate } from '../context/TemplateContext';
import { useCredential } from '../context/CredentialContext';
import { useContact } from '../context/ContactContext'
import { useGroup } from '../context/GroupContext';
import LoaderGeneral from '../components/LoaderGeneral';
import SendSummaryModal from '../components/SendSummaryModal';
import { Link } from 'react-router-dom';
import { Alert, Icon, PageHeader } from '../components/ui';

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
    const [lastExecutionId, setLastExecutionId] = useState(null);

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
        handleShareTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id]);  // Se ejecuta solo una vez al montar el componente

    // Al elegir una plantilla se cargan sus datos automáticamente (antes había un botón "Cargar Datos")
    useEffect(() => {
        if (selectedOption_NameTemplate !== '') {
            handleShareTemplateComponents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOption_NameTemplate]);

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
        // Las variables asignadas pertenecen a la plantilla anterior
        setSelectedHeaderKeys([]);
        setSelectedBodyKeys([]);
        setSelectedButtonKeys([]);
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
            const response = await sendMessagesByTemplate({ ...data, groupId: destinationGroup }, (sent, total) => setProgress({ sent, total }));
            setSendResults(response.results);
            setLastExecutionId(response.executionId);
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

    /*------------------------------------------------------------------------------------------------------*/
    /*-------------------------------------VISTA PREVIA Y RESUMEN-------------------------------------------*/
    const templateLoaded = isGroupSelectEnabled && templateDataFilter.length > 0;
    const loadedTemplate = templateLoaded ? templateDataFilter[0] : null;
    const sampleContact = filteredContacts[0];

    const countAssigned = (variables, keys) => variables.filter((_, i) => Array.isArray(keys) && keys[i]).length;
    const totalVariables = dynamicVariablesHeaderSelect.length + dynamicVariablesBodySelect.length + dynamicVariablesButtonSelect.length;
    const assignedVariables = templateLoaded
        ? countAssigned(dynamicVariablesHeaderSelect, selectedHeaderKeys) +
          countAssigned(dynamicVariablesBodySelect, selectedBodyKeys) +
          countAssigned(dynamicVariablesButtonSelect, selectedButtonKeys)
        : 0;

    const pendingStep = !templateLoaded
        ? 'Elige una plantilla'
        : !destinationGroup
            ? 'Elige el grupo de destino'
            : filteredContacts.length === 0
                ? 'El grupo no tiene contactos'
                : assignedVariables < totalVariables
                    ? `Asigna ${totalVariables - assignedVariables} variable(s) pendiente(s)`
                    : null;
    const readyToSend = !pendingStep && isSendButtonEnabled && !sending;

    // Reemplaza {{n}} por el valor del primer contacto (si la variable ya está asignada)
    const fillPreview = (text = '', keys) =>
        text.split(/({{\s*\d+\s*}})/g).map((part, index) => {
            const match = part.match(/{{\s*(\d+)\s*}}/);
            if (!match) return part;
            const key = Array.isArray(keys) ? keys[Number(match[1]) - 1] : null;
            const value = key && sampleContact
                ? (key === NAME_KEY ? sampleContact.name : sampleContact.variables?.[key])
                : null;
            return (
                <span key={index} className={value ? 'font-medium' : 'rounded bg-[var(--warning-bg)] px-1 text-[var(--warning)]'}>
                    {value || part}
                </span>
            );
        });

    const previewComponents = loadedTemplate?.components || [];
    const previewHeader = previewComponents.find(c => c.type === 'HEADER');
    const previewBody = previewComponents.find(c => c.type === 'BODY');
    const previewFooter = previewComponents.find(c => c.type === 'FOOTER');
    const previewButtons = previewComponents.find(c => c.type === 'BUTTONS')?.buttons || [];

    const selectedGroupName = groups.find(g => g._id === destinationGroup)?.groupName;

    const renderVariableSelects = (variables, keys, onChange, sectionLabel) =>
        variables.map((variable, index) => (
            <div key={`${sectionLabel}-${index}`}>
                <label className="g-label">
                    <span className="font-mono text-accent">{variable}</span> en {sectionLabel}
                </label>
                <select
                    className="g-select"
                    value={(Array.isArray(keys) && keys[index]) || ''}
                    onChange={(e) => onChange(e.target.value, index)}
                >
                    {renderVariableOptions()}
                </select>
            </div>
        ));

    const StepBadge = ({ number, done }) => (
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${done ? 'bg-primary text-on-primary' : 'bg-surface-3 text-fg-2'}`}>
            {done ? <Icon name="check" size={18} /> : number}
        </span>
    );

    const sendButton = (
        <button
            type="button"
            className="g-btn-primary h-14 w-full text-base shadow-md"
            onClick={handleSendTemplates}
            disabled={!readyToSend}
        >
            <Icon name="send" filled size={22} />
            {sending
                ? `Enviando ${progress.sent} de ${progress.total}…`
                : readyToSend
                    ? `Enviar plantilla a ${filteredContacts.length} contacto(s)`
                    : 'Enviar plantilla'}
        </button>
    );

    return (
        <>
            {loadingRefresh && <LoaderGeneral />}
            {loadingData && <LoaderGeneral />}
            <SendSummaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sendResults={sendResults}
                executionId={lastExecutionId}
            />

            <PageHeader
                title="Nuevo envío"
                subtitle={`Hola ${user.firstName}, elige una plantilla aprobada y un grupo, asigna las variables y envía.`}
                actions={
                    <button type="button" className="g-btn-tonal" onClick={handleShareTemplates} disabled={loadingRefresh}>
                        <Icon name="refresh" size={20} />
                        {loadingRefresh ? 'Actualizando…' : 'Actualizar plantillas'}
                    </button>
                }
            />

            {errorMessage && <Alert type="error" className="mb-4">{errorMessage}</Alert>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                {/* ------------------------------ PASOS ------------------------------ */}
                <div className="flex flex-col gap-4 lg:col-span-3">
                    <section className="g-card">
                        <div className="mb-4 flex items-center gap-3">
                            <StepBadge number={1} done={templateLoaded} />
                            <h2 className="g-section-title">Elige la plantilla</h2>
                            <span className="g-chip ml-auto">{templates.length} aprobada(s)</span>
                        </div>
                        <select
                            className="g-select"
                            value={selectedOption_NameTemplate}
                            onChange={handleSelectionChange}
                        >
                            <option value="">Selecciona una plantilla</option>
                            {templates.map((template, index) => (
                                <option key={index} value={index}>{template.name} ({template.language})</option>
                            ))}
                        </select>
                        {templates.length === 0 && !loadingRefresh && (
                            <p className="mt-3 text-sm text-muted">
                                No hay plantillas aprobadas. Revisa tus credenciales en <Link to="/settings" className="text-accent underline">Configuración</Link> o crea una plantilla en WhatsApp Manager.
                            </p>
                        )}
                    </section>

                    <section className={`g-card ${!templateLoaded ? 'opacity-60' : ''}`}>
                        <div className="mb-4 flex items-center gap-3">
                            <StepBadge number={2} done={!!destinationGroup && filteredContacts.length > 0} />
                            <h2 className="g-section-title">Elige el grupo de destino</h2>
                        </div>
                        <select
                            className="g-select"
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
                            <p className="mt-3 flex items-center gap-2 text-sm text-fg-2">
                                <Icon name="group" size={18} /> {filteredContacts.length} contacto(s) recibirán el mensaje
                            </p>
                        )}
                        {groups.length === 0 && (
                            <p className="mt-3 text-sm text-muted">
                                Aún no tienes grupos. Créalos e importa contactos en <Link to="/contacts" className="text-accent underline">Contactos</Link>.
                            </p>
                        )}
                    </section>

                    <section className={`g-card ${!templateLoaded ? 'opacity-60' : ''}`}>
                        <div className="mb-4 flex items-center gap-3">
                            <StepBadge number={3} done={templateLoaded && assignedVariables === totalVariables} />
                            <h2 className="g-section-title">Asigna las variables</h2>
                            {templateLoaded && totalVariables > 0 && (
                                <span className="g-chip ml-auto">{assignedVariables}/{totalVariables}</span>
                            )}
                        </div>
                        {!templateLoaded && <p className="text-sm text-muted">Primero elige una plantilla.</p>}
                        {templateLoaded && totalVariables === 0 && (
                            <p className="flex items-center gap-2 text-sm text-fg-2"><Icon name="check_circle" size={18} className="text-[var(--success)]" /> Esta plantilla no tiene variables.</p>
                        )}
                        {templateLoaded && totalVariables > 0 && (
                            <>
                                <p className="mb-4 text-sm text-fg-2">
                                    Elige qué dato de cada contacto reemplaza cada variable. Puedes usar el nombre o cualquier columna del Excel.
                                </p>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {renderVariableSelects(dynamicVariablesHeaderSelect, selectedHeaderKeys, handleSelectHeaderChange, 'el encabezado')}
                                    {renderVariableSelects(dynamicVariablesBodySelect, selectedBodyKeys, handleSelectBodyChange, 'el cuerpo')}
                                    {renderVariableSelects(dynamicVariablesButtonSelect, selectedButtonKeys, handleSelectButtonChange, 'el botón')}
                                </div>
                                {!destinationGroup && (
                                    <p className="mt-3 text-xs text-muted">Elige el grupo para ver las columnas disponibles de tus contactos.</p>
                                )}
                            </>
                        )}
                        {templateLoaded && (
                            <details className="mt-5 rounded-2xl bg-bg p-4 text-sm">
                                <summary className="cursor-pointer text-fg-2">Ver contenido y ejemplos de Meta</summary>
                                <dl className="mt-3 grid grid-cols-1 gap-3 text-fg-2">
                                    <div><dt className="text-xs uppercase text-muted">Encabezado</dt><dd>{headerContent} <span className="text-muted">· {headerExamples}</span></dd></div>
                                    <div><dt className="text-xs uppercase text-muted">Cuerpo</dt><dd className="whitespace-pre-line">{bodyContent} <span className="text-muted">· {bodyExamples}</span></dd></div>
                                    <div><dt className="text-xs uppercase text-muted">Pie</dt><dd>{footerContent}</dd></div>
                                    <div><dt className="text-xs uppercase text-muted">Botones</dt><dd>{buttonText} <span className="text-muted">· {buttonContent}</span></dd></div>
                                </dl>
                            </details>
                        )}
                    </section>
                </div>

                {/* --------------------------- RESUMEN Y ENVÍO --------------------------- */}
                <aside className="flex flex-col gap-4 lg:col-span-2 lg:sticky lg:top-2 lg:self-start">
                    <section className="g-card">
                        <h2 className="g-section-title mb-4">Vista previa</h2>
                        <div className="rounded-2xl bg-[#e7ded5] p-4" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                            {loadedTemplate ? (
                                <div className="max-w-[300px] rounded-xl rounded-tl-none bg-white p-3 text-[14px] leading-snug text-[#111b21] shadow-sm">
                                    {previewHeader?.format === 'TEXT' && (
                                        <p className="mb-1 font-semibold">{fillPreview(previewHeader.text, selectedHeaderKeys)}</p>
                                    )}
                                    {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(previewHeader?.format) && (
                                        <div className="mb-2 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-[#d1d7db] text-[#54656f]">
                                            {previewHeader.format === 'IMAGE' && previewHeader.example?.header_handle?.[0]
                                                ? <img src={previewHeader.example.header_handle[0]} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                : <Icon name={previewHeader.format === 'VIDEO' ? 'movie' : previewHeader.format === 'DOCUMENT' ? 'description' : 'image'} size={36} />}
                                        </div>
                                    )}
                                    {previewBody && <p className="whitespace-pre-line">{fillPreview(previewBody.text, selectedBodyKeys)}</p>}
                                    {previewFooter && <p className="mt-1 text-xs text-[#667781]">{previewFooter.text}</p>}
                                    <p className="mt-1 text-right text-[11px] text-[#667781]">12:00</p>
                                    {previewButtons.length > 0 && (
                                        <div className="-mx-3 -mb-3 mt-2 divide-y divide-[#e9edef] border-t border-[#e9edef]">
                                            {previewButtons.map((button, index) => (
                                                <p key={index} className="flex items-center justify-center gap-1 py-2 text-[#027eb5]">
                                                    <Icon name={button.type === 'URL' ? 'open_in_new' : button.type === 'PHONE_NUMBER' ? 'call' : 'reply'} size={16} />
                                                    {button.text}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="py-10 text-center text-sm text-[#54656f]">Elige una plantilla para ver cómo se verá el mensaje.</p>
                            )}
                        </div>
                        {loadedTemplate && sampleContact && (
                            <p className="mt-2 text-xs text-muted">Ejemplo con los datos de {sampleContact.name}.</p>
                        )}
                    </section>

                    <section className="g-card border-2 border-[var(--accent)]">
                        <h2 className="g-section-title mb-3">Resumen del envío</h2>
                        <ul className="mb-5 flex flex-col gap-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Icon name={templateLoaded ? 'check_circle' : 'radio_button_unchecked'} size={20} className={templateLoaded ? 'text-[var(--success)]' : 'text-muted'} />
                                <span className="text-muted">Plantilla:</span>
                                <span className="truncate text-fg">{loadedTemplate ? loadedTemplate.name : '—'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Icon name={destinationGroup ? 'check_circle' : 'radio_button_unchecked'} size={20} className={destinationGroup ? 'text-[var(--success)]' : 'text-muted'} />
                                <span className="text-muted">Grupo:</span>
                                <span className="truncate text-fg">{selectedGroupName || '—'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Icon name={filteredContacts.length > 0 && destinationGroup ? 'check_circle' : 'radio_button_unchecked'} size={20} className={filteredContacts.length > 0 && destinationGroup ? 'text-[var(--success)]' : 'text-muted'} />
                                <span className="text-muted">Destinatarios:</span>
                                <span className="text-fg">{destinationGroup ? filteredContacts.length : '—'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Icon name={templateLoaded && assignedVariables === totalVariables ? 'check_circle' : 'radio_button_unchecked'} size={20} className={templateLoaded && assignedVariables === totalVariables ? 'text-[var(--success)]' : 'text-muted'} />
                                <span className="text-muted">Variables:</span>
                                <span className="text-fg">{templateLoaded ? (totalVariables ? `${assignedVariables} de ${totalVariables} asignadas` : 'no tiene') : '—'}</span>
                            </li>
                        </ul>

                        {sending && (
                            <div className="mb-4">
                                <div className="mb-1 flex justify-between text-xs text-fg-2">
                                    <span>Enviando…</span>
                                    <span>{progress.sent}/{progress.total}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                                    <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${progress.total ? (progress.sent / progress.total) * 100 : 0}%` }} />
                                </div>
                            </div>
                        )}

                        {sendButton}
                        <p className="mt-3 text-center text-xs text-muted">
                            {pendingStep && !sending
                                ? <>Falta: <strong className="text-fg-2">{pendingStep}</strong></>
                                : 'Se envía una sola vez a cada contacto del grupo. Te pediremos confirmación.'}
                        </p>
                    </section>
                </aside>
            </div>

            {/* En móvil el botón de envío queda siempre visible abajo */}
            <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-line bg-bg px-4 pb-4 pt-3 sm:-mx-6 sm:px-6 lg:hidden">
                {sendButton}
                {pendingStep && !sending && (
                    <p className="mt-2 text-center text-xs text-muted">Falta: <strong className="text-fg-2">{pendingStep}</strong></p>
                )}
            </div>
        </>
    )
}

export default TemplatesPage;
