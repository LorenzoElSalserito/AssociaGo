# 15. Comunicaciones

La sección **Comunicaciones** permite enviar correos electrónicos institucionales a los socios, gestionar plantillas predefinidas y rastrear el estado de entrega.

## 15.1 Descripción general
La página está dividida en dos pestañas:
- **Mensajes**: La lista de comunicaciones creadas y enviadas.
- **Plantillas**: Las plantillas reutilizables para agilizar la creación de mensajes.

## 15.2 Gestión de Plantillas

### Crear una Plantilla
1. Desde la pestaña **Plantillas**, haz clic en **"Nueva Plantilla"**.
2. Completa:
   - **Nombre**: Nombre identificativo (ej. "Convocatoria de Asamblea").
   - **Asunto**: El asunto del correo electrónico.
   - **Cuerpo HTML**: El texto del mensaje.
   - **Cuerpo Texto**: Versión solo texto (para clientes de correo que no soportan HTML).
   - **Categoría**: General, Renovación, Evento, Actividad, Asamblea, Fiscal.
3. Utiliza los **campos de combinación** en el texto:
   - `{{name}}` — Nombre completo del destinatario.
   - `{{associationName}}` — Nombre de la asociación.
4. Haz clic en **"Guardar"**.

### Aplicar una Plantilla
Al crear un nuevo mensaje, es posible seleccionar una plantilla del menú desplegable. El asunto y el cuerpo se precargarán con los datos de la plantilla.

## 15.3 Creación y Envío de Mensajes

### Crear un Mensaje
1. Desde la pestaña **Mensajes**, haz clic en **"Nuevo Mensaje"**.
2. Completa:
   - **Asunto**: El asunto del correo electrónico.
   - **Cuerpo**: El contenido del mensaje.
   - **Filtro de destinatarios**: Filtra los socios por estado (ej. solo Activos).
3. Haz clic en **"Guardar como Borrador"** o procede al envío.

### Resolver los Destinatarios
Antes del envío, haz clic en **"Resolver Destinatarios"** para:
- Visualizar la lista completa de los socios que recibirán el mensaje.
- Verificar las direcciones de correo electrónico.
- Comprobar el número total de destinatarios.

### Enviar
1. Haz clic en **"Enviar"**.
2. El sistema envía los correos electrónicos a través del servidor SMTP configurado en los ajustes.
3. El estado pasa de **Borrador** a **En envío** y luego a **Enviado**.

## 15.4 Estadísticas de Entrega
Para cada mensaje enviado, la vista de detalle muestra:
- **Total destinatarios**: Número de correos enviados.
- **Entregados**: Correos entregados con éxito.
- **Fallidos**: Correos no entregados (con detalle del error).
- **Fecha de envío**: Marca temporal del envío.

## 15.5 Estados de los Mensajes
| Estado | Significado |
|--------|-------------|
| Borrador | Mensaje guardado pero aún no enviado. |
| En envío | Envío en curso. |
| Enviado | Todos los mensajes han sido procesados. |
| Fallido | El envío ha encontrado errores. |

> **Nota**: Para utilizar las comunicaciones por correo electrónico, es necesario configurar un servidor SMTP en los ajustes de la aplicación (variables de entorno SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
