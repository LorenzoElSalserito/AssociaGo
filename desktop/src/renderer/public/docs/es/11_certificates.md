# 11. Certificados y Diplomas

La sección **Certificados** permite crear plantillas personalizables y emitir certificados para socios, participantes en actividades y participantes en eventos.

## 11.1 Descripción general

La página está dividida en dos pestañas principales:
- **Plantillas**: Las plantillas a partir de las cuales se generan los certificados.
- **Emitidos**: La lista de todos los certificados ya generados, con la posibilidad de descargarlos en PDF.

## 11.2 Gestión de Plantillas

### Crear una Nueva Plantilla
Haz clic en **"Nueva Plantilla"** para abrir el cuadro de diálogo de creación. El cuadro está organizado en cuatro secciones:

#### General
- **Nombre**: El nombre identificativo de la plantilla (ej. "Certificado de Participación Curso Básico").
- **Tipo**: Selecciona la tipología entre:
  - *Participación* — para quienes han participado en una actividad o evento.
  - *Asistencia* — para quienes han completado un itinerario con asistencia mínima.
  - *Formación* — para cursos formativos con certificación.
  - *Inscripción* — certificado de pertenencia a la asociación.
  - *Personalizado* — formato libre para necesidades específicas.
- **Activo**: Interruptor para habilitar/deshabilitar la plantilla. Solo las plantillas activas pueden usarse para la emisión.

#### Cuerpo
Aquí se redacta el texto del certificado. Una fila de **botones de campos dinámicos** permite insertar marcadores de posición que se sustituirán automáticamente con los datos reales:

| Campo | Descripción |
|-------|-------------|
| `{{firstName}}` | Nombre del socio |
| `{{lastName}}` | Apellido del socio |
| `{{fiscalCode}}` | Código fiscal |
| `{{associationName}}` | Nombre de la asociación |
| `{{date}}` | Fecha de emisión |
| `{{activityName}}` | Nombre de la actividad asociada |
| `{{activityCategory}}` | Categoría de la actividad |
| `{{eventName}}` | Nombre del evento asociado |
| `{{eventType}}` | Tipología del evento |

Haz clic en un botón para insertar el campo en la posición actual del cursor en el texto.

#### Maquetación
- **Orientación**: Horizontal (landscape) o Vertical (portrait).
- **Formato de Papel**: A4, A3 o Letter.

#### Firmantes
Selecciona qué cargos institucionales deben firmar el certificado:
- Presidente
- Secretario
- Tesorero

Las firmas se colocarán al pie del certificado PDF generado, tomando automáticamente las imágenes de las firmas configuradas en la sección Ajustes > Firmas.

### Vista Previa en Tiempo Real
En el lado derecho del cuadro de diálogo, un **panel de vista previa** muestra cómo se verá el certificado. Los campos dinámicos se sustituyen con datos de ejemplo (ej. "Mario Rossi") para dar una idea del resultado final. La vista previa también refleja la orientación y el estado activo/inactivo.

### Modificar una Plantilla
Haz clic en el icono de **lápiz** en la fila de la plantilla para abrir el cuadro de diálogo con todos los datos precargados.

### Eliminar una Plantilla
Haz clic en el icono de **papelera**. Se pedirá confirmación antes de la eliminación. Las plantillas con certificados ya emitidos no pueden eliminarse.

## 11.3 Emisión de Certificados

### Emisión Individual
1. Haz clic en **"Emitir Certificado"**.
2. Selecciona la **plantilla** del menú desplegable.
3. Introduce el **ID del socio** destinatario.
4. Haz clic en **"Emitir"**.

El sistema genera un certificado con número único (formato: CERT-AÑO-NNNN) y lo asocia al socio.

### Emisión Masiva (Batch)
Para emitir certificados a todos los participantes de una actividad o evento:
1. Selecciona la plantilla.
2. En la sección inferior, elige una **actividad** o un **evento** del menú desplegable.
3. Haz clic en **"Emisión masiva por Actividad"** o **"Emisión masiva por Evento"**.

Todos los participantes activos recibirán un certificado.

## 11.4 Descarga PDF
En la pestaña **Emitidos**, cada certificado tiene un botón de **descarga**. El PDF generado incluye:
- Título y cuerpo del certificado con los datos completados.
- Número único del certificado.
- Fecha de emisión.
- Firmas institucionales.
- Checksum SHA-256 para la verificación de autenticidad.
