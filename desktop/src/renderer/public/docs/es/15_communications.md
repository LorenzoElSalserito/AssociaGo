# 15. Comunicaciones

La página **Comunicaciones** (barra lateral, grupo **Gobernanza**) sirve para preparar y enviar correos a los socios. Tiene dos pestañas: **Mensajes** y **Plantillas**; junto a cada una, un contador indica cuántos elementos contiene.

## 15.1 Plantillas

En la pestaña **Plantillas** pulsa **Nueva plantilla** y rellena:
- **Nombre** (obligatorio; sin él, el botón **Crear** sigue desactivado);
- **Asunto**;
- **Cuerpo (HTML)**: el texto del mensaje. Puedes usar los marcadores `{{name}}` (nombre y apellido del destinatario) y `{{associationName}}` (nombre de la asociación).

La tabla muestra **Nombre de plantilla** y **Asunto**. Las acciones de cada fila son editar (lápiz y después **Guardar**) y eliminar (papelera, con confirmación).

## 15.2 Crear un mensaje

En la pestaña **Mensajes** pulsa **Nuevo Mensaje**.
- **Aplicar plantilla**: solo aparece si existe al menos una plantilla y solo para los mensajes nuevos. Copia el asunto y el cuerpo de la plantilla en el mensaje.
- **Asunto** (obligatorio).
- **Nombre del remitente** y **Email del remitente**. El correo pasa a ser el remitente del mensaje; si lo dejas vacío se usa `noreply@associago.local`. El nombre del remitente se guarda, pero no aparece en el correo.
- **Filtro de segmento**: campo de texto libre. Si contiene la palabra `active`, el mensaje va solo a los socios con inscripción activa; cualquier otro texto, o el campo vacío, significa todos los socios de la asociación con una dirección de correo.
- **Cuerpo del mensaje (HTML)**, con los mismos marcadores que las plantillas.

Pulsa **Crear**. El mensaje nace en estado **Borrador**.

La tabla de mensajes muestra **Asunto**, **Estado**, número de **Destinatarios** y **Fecha** de creación. Solo los borradores se pueden editar (lápiz); la papelera elimina el mensaje tras una confirmación.

## 15.3 Destinatarios y envío

Haz clic en un mensaje para abrir su detalle. Para un borrador:
1. pulsa **Resolver destinatarios**: la app calcula la lista a partir de los socios de la asociación, según el Filtro de segmento, y muestra cuántos destinatarios ha encontrado. Cada dirección de correo aparece una sola vez; si vuelves a pulsar, la lista se recalcula desde cero;
2. pulsa **Enviar** (activo solo después de resolver los destinatarios) y confirma.

El correo se envía como texto simple: el contenido escrito en el editor se convierte manteniendo párrafos y saltos de línea, sin formato. Antes de una comunicación importante, prueba un envío a una dirección tuya.

## 15.4 Detalle y estadísticas

Arriba hay cuatro recuadros: **Destinatarios totales**, **Entregados**, **Fallidos** y **Enviado el**. Debajo encuentras el **Contenido del mensaje** y la tabla **Destinatarios** con nombre, correo, estado (Pendiente, Enviado o Fallido) y hora de envío.

"Entregados" significa que el servidor de correo aceptó el mensaje, no que haya llegado al buzón del socio.

Al terminar el envío, el mensaje pasa a **Enviado**; si el servidor no aceptó ningún correo, pasa a **Fallido**. En caso de envíos parciales revisa el recuadro **Fallidos** y la columna de estado de los destinatarios.

## 15.5 Configurar el servidor de correo

En la app no hay una pantalla para el servidor de correo: debe configurarlo el administrador definiendo estas variables de entorno antes de iniciar AssociaGo.

| Variable | Para qué sirve | Valor si no existe |
|---|---|---|
| `SMTP_HOST` | dirección del servidor de correo saliente | `localhost` |
| `SMTP_PORT` | puerto del servidor (normalmente 587 o 25) | `25` |
| `SMTP_USER` | nombre de usuario del buzón | vacío |
| `SMTP_PASSWORD` | contraseña del buzón | vacía |
| `SMTP_AUTH` | `true` si el servidor pide usuario y contraseña | `false` |
| `SMTP_TLS` | `true` para usar la conexión cifrada STARTTLS | `false` |

Sin estos ajustes, la app busca un servidor de correo en el propio equipo: casi nunca lo hay, así que todos los correos acaban en **Fallidos**.
