import fetch from 'node-fetch';
import axios from 'axios';  //Axios para realizar peticiones HTTP
import Template from "../models/template.model.js";

export const getTemplates = async (req, res) => {
    //inicio loader
    const { waba_id, access_token } = req.query;

    try {
        // Verifica si se han proporcionado los parámetros necesarios
        if (!waba_id || !access_token) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const url = `https://graph.facebook.com/v19.0/${waba_id}/message_templates`;

        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        };

        const response = await fetch(url, options);
        const data = await response.json();
        //fin loader
        // Manejo de errores de la respuesta de la API
        if (!response.ok) {
            return res.status(response.status).json({ message: data.error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ------------------------------------------------------------------------------------------------ */

export const sendMessagesByTemplateAndListContacts = (req, res) => {
    const { template, recipientList, accessToken, phoneId } = req.body;

    if (!template || !recipientList || !accessToken || !phoneId) {
        return res.status(400).json({ error: 'Faltan parámetros necesarios' });
    }

    // Array para almacenar los resultados
    let resultArray = [];

    // Función auxiliar para agregar resultados al array
    const addResult = (phone, state, description) => {
        resultArray.push({
            phone,
            state,
            description
        });
    };

    // Procesar cada destinatario en la lista
    const promises = recipientList.map(recipient => {
        const { number, variables } = recipient;
        const payload = createMessagePayload(template, variables);

        return sendMessage({ ...payload, to: number }, accessToken, phoneId)
            .then(response => {
                console.log(`Mensaje enviado a ${number}`, response.data);

                // Agregar resultado exitoso
                addResult(number, "success", "");
            })
            .catch(error => {
                console.error(`Error al enviar mensaje a ${number}`, error.response.data);

                // Agregar resultado con error
                const errorMessage = error.response?.data?.error?.message || 'Error desconocido';
                addResult(number, "warning", errorMessage);
            });
    });

    // Esperar a que se completen todas las promesas
    Promise.all(promises)
        .then(() => {
            // Mostrar el array final por consola
            console.log("Array final de resultados:", resultArray);

            // Retornar el array con todos los resultados al frontend
            res.status(200).json({ results: resultArray });

            // Limpiar el array después de enviar los resultados
            resultArray = [];
        })
        .catch(error => {
            // Manejo de cualquier error inesperado en el proceso general
            res.status(500).json({ error: 'Error al procesar los mensajes' });
        });
};

const createMessagePayload = (template, contactVariables) => {
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "",  // Este campo se completará más tarde
        type: "template",
        template: {
            name: template.name,
            language: {
                code: template.language || 'es'
            },
            components: []
        }
    };
    template.components.forEach(component => {
        switch (component.type.toUpperCase()) {
            case 'HEADER':
                if (component.format && component.format.toUpperCase() === 'IMAGE') {
                    payload.template.components.push({
                        type: "header",
                        parameters: [{
                            type: "image",
                            image: {
                                link: component.example.header_handle[0]
                            }
                        }]
                    });
                } else {
                    payload.template.components.push({
                        type: "header",
                        parameters: processParameters(component.text, contactVariables.header || [])
                    });
                }
                break;
            case 'BODY':
                payload.template.components.push({
                    type: "body",
                    parameters: processParameters(component.text, contactVariables.body || [])
                });
                break;
            case 'FOOTER':
                // El footer no necesita parámetros, por lo tanto, no se agrega al payload
                break;
            case 'BUTTONS':
                component.buttons.forEach((button, index) => {
                    if (button.type.toUpperCase() === 'URL' && shouldIncludeButton(button)) {
                        console.log(contactVariables.buttons);

                        payload.template.components.push({
                            type: "button",
                            sub_type: "url",
                            index: index.toString(),
                            parameters: processButtonParameters(button.url, getButtonVariables(contactVariables.buttons, index))
                        });
                    } else if (button.type.toUpperCase() === 'QUICK_REPLY') {
                        payload.template.components.push({
                            type: "button",
                            sub_type: "quick_reply",
                            index: index.toString(),
                            parameters: [{ type: "payload", payload: button.text }]
                        });
                    }
                });
                break;
            default:
                console.warn(`Componente desconocido: ${component.type}`);
        }
    });

    return payload;
};

const processParameters = (text, variables) => {
    const parameters = [];
    const matches = text.match(/{{\d+}}/g);

    if (matches) {
        matches.forEach(match => {
            const variableIndex = parseInt(match.replace(/[{}]/g, ''), 10);
            if (variables[variableIndex - 1]) {
                parameters.push({
                    type: "text",
                    text: variables[variableIndex - 1]
                });
            }
        });
    }

    return parameters;
};

const getButtonVariables = (buttons, index) => {
    const button = buttons ? buttons[index] : null;
    console.log("VARIABLE DE BOTóN", button);
    return button ? [button] : [];
};

const shouldIncludeButton = (button) => {
    // Solo incluimos el botón si tiene variables en la URL
    return button.url.includes('{{');
};

const processButtonParameters = (url, variables) => {
    // Validar y limpiar las variables antes de usarlas
    const cleanVariables = (vars) => {
        return (vars || []).map(variable => {
            // Elimina espacios en blanco al principio y al final
            return variable ? variable.trim() : '';
        }).filter(variable => variable !== ''); // Filtra las variables vacías
    };

    // Limpia las variables antes de enviarlas
    const cleanedVariables = cleanVariables(variables);

    // Genera los parámetros para el botón
    return cleanedVariables.map(variable => ({
        type: 'text',
        text: variable
    }));
};

const sendMessage = (payload, accessToken, phoneId) => {
    console.log(JSON.stringify(payload, null, 2));
    return axios.post(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        payload,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );
};