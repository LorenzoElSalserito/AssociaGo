# 11. Certificados y Diplomas

La página **Certificados** tiene dos pestañas: **Plantillas** y **Emitidos**. Arriba encuentras los botones **Nueva plantilla** y **Emitir certificado**.

## 11.1 Plantillas

La tabla muestra para cada plantilla el nombre, el tipo, la maquetación (orientación / tamaño) y el estado **Activo** o **Inactivo**. Las acciones son el icono del **lápiz** (editar) y el icono de la **papelera** (eliminar, tras la confirmación **¿Estás seguro?**).

> Si la plantilla ya se ha usado para emitir certificados, la eliminación falla y aparece un mensaje de error de la base de datos. No hay un aviso específico.

## 11.2 Crear una plantilla

Pulsa **Nueva plantilla**. A la izquierda hay cuatro pestañas y a la derecha la **Vista previa**.

### General
- **Nombre** (obligatorio: sin nombre, **Crear** sigue desactivado). También se convierte en el título del certificado.
- **Tipo**: Participación, Asistencia, Formación, Membresía o Personalizado.
- **Activo**: interruptor.

> El estado **Activo** es solo informativo: las plantillas inactivas también aparecen en la emisión y se pueden usar.

### Cuerpo
Escribe el texto en **Cuerpo de la plantilla**. Los botones situados encima del campo insertan un campo dinámico en la posición del cursor:

| Campo | Se sustituye por |
|-------|----------------------|
| `{{firstName}}`, `{{lastName}}` | nombre y apellido del destinatario |
| `{{fiscalCode}}` | código fiscal del destinatario |
| `{{associationName}}` | nombre de la asociación |
| `{{date}}` | fecha de emisión |
| `{{activityName}}`, `{{activityCategory}}` | nombre y categoría de la actividad (solo emisión por actividad) |
| `{{eventName}}`, `{{eventType}}` | nombre y tipo del evento, como código interno (solo emisión por evento) |

Los campos de actividad y evento se quedan como texto literal si el certificado no se emite desde una actividad o un evento. En el PDF el cuerpo se convierte en texto simple: las etiquetas HTML que haya se eliminan.

### Maquetación
- **Orientación**: **Horizontal** o **Vertical**.
- **Tamaño de papel**: A4, A3 o Letter.

> El tamaño de papel se guarda pero no se usa: el PDF siempre es A4, en la orientación elegida.

### Firmantes
Marca los **Roles de firmantes**: Presidente (preseleccionado), Secretario, Tesorero. En el PDF cada rol tiene un bloque de firma con la imagen, el nombre y el cargo tomados de **Ajustes › Firmas** (capítulo 16); si un rol no tiene una firma guardada, aparece el nombre del **Organigrama** (**Ajustes › Perfil de la Asociación**) sobre una línea vacía.

### Vista previa
Muestra el título, el cuerpo con datos de ejemplo (p. ej. "Mario Rossi") y una línea de firma para cada rol marcado. Sigue la orientación elegida.

Pulsa **Crear** (o **Guardar** al editar).

## 11.3 Emitir certificados

Pulsa **Emitir certificado** y elige la **Plantilla**.

### A un socio
1. En **Socio** elige un nombre de la lista de socios de la asociación.
2. Pulsa **Emitir**.

### A todos los participantes
Bajo **O emitir en lote para todos los participantes:**
- elige una **Actividad** y pulsa **Emisión masiva por actividad**: reciben el certificado los participantes activos inscritos como socios;
- o bien elige un **Evento** y pulsa **Emisión masiva por evento**: reciben el certificado los participantes registrados como socios; los invitados se omiten.

Los botones solo aparecen después de elegir la plantilla y la actividad o el evento. También puedes emitir en bloque desde la pestaña **Certificados** de una actividad (capítulo 3).

> No hay control de duplicados: si repites la emisión, cada destinatario recibe un certificado nuevo.

Cada certificado recibe un número correlativo con el formato **CERT-AÑO-NNNN**. El texto y el título se congelan en el momento de la emisión: modificar la plantilla después no cambia los certificados ya emitidos. Las firmas, en cambio, se leen en cada descarga, según los roles de la plantilla.

## 11.4 Certificados emitidos y PDF

La pestaña **Emitidos** (con el contador) lista **Certificado** (número), **Destinatario** (nombre del socio) y **Emitido el**. El icono de **descarga** descarga el PDF (A4, con número y fecha en el idioma de la interfaz), que contiene:
- título (nombre de la plantilla), número y fecha de emisión;
- cuerpo con los datos rellenados;
- un bloque de firma para cada rol firmante (imagen, nombre y cargo);
- un código QR abajo a la derecha con número, asociación y fecha.

> En cada descarga se calcula y se guarda una suma de comprobación SHA-256 del PDF, pero no se imprime en el documento ni se muestra en la interfaz.
