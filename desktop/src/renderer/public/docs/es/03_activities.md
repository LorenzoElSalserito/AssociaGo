# 3. Gestión de Actividades

La página **Actividades y Cupones** tiene dos pestañas: **Actividades** (cursos, talleres, seminarios) y **Cupones** (consulta el capítulo 9).

## 3.1 Lista de actividades

Para cada actividad la tabla muestra:
- nombre y categoría;
- periodo (fecha de inicio y de fin);
- número máximo de participantes, o "Unlimited" si no hay límite;
- estado.

**Buscar actividades...** filtra por nombre. Las acciones de cada fila son **Ver detalles**, **Editar** y **Eliminar**.

## 3.2 Crear una actividad

Pulsa **Añadir Actividad**.

### Datos principales
- **Nombre de la Actividad** y **Categoría** son obligatorios. Las categorías son Curso, Taller, Seminario y Otro.
- **Descripción** y **Ubicación**.
- **Fecha de Inicio** (obligatoria), **Fecha de Fin**, **Hora de Inicio** y **Hora de Fin**.
- **Detalles de Horario**: nota libre, por ejemplo "Lun/Mié 18-20".

### Inscripción y costes
- **Costo** y **Tipo de Suscripción**: Pago Único, Mensual o Anual.
- **Máx. Participantes**: déjalo vacío si no hay límite.
- **Requiere Inscripción** y **Generar Factura**.
- **Ruta/URL de Documento** y **Ruta/URL de Imagen**, para adjuntar material.

Pulsa **Guardar Actividad** para confirmar.

## 3.3 Ficha de detalle

Arriba hay cuatro indicadores: **Participantes**, **Ingresos**, **Costos** y **Beneficio Neto**. Debajo hay seis pestañas.

### Participantes
**Añadir Participante** abre la lista de socios (**Seleccionar Socio**) y un campo opcional **Código de cupón** (consulta 9.3). La cuota debida es el costo de la actividad, menos el posible descuento. La tabla muestra el estado y el pago de cada participante (Pagado, Pendiente) con el importe debido y, si se ha usado, el cupón con el descuento; también permite quitarlo.

En los **Ingresos** las cuotas aún no pagadas cuentan por el importe debido, ya descontado.

### Horarios
**Añadir Horario** registra las clases recurrentes: día de la semana, hora de inicio y de fin, lugar (opcional).

### Instructores
**Añadir Instructor** registra:
- nombre y apellido (obligatorios), correo, teléfono;
- **Especialización** y **Certificaciones** (p. ej. CONI, FIGC);
- **Tipo de compensación** (Por Hora, Tarifa fija o Porcentaje) e importe.

### Costes
**Añadir Costo** registra los gastos de la actividad:
- descripción, importe y fecha (obligatorios);
- categoría: Materiales, Equipamiento, Personal, Alquiler / Sede, Marketing, Otro;
- proveedor, **Costo Recurrente** y notas.

Los costes se tienen en cuenta en el Beneficio Neto.

### Certificados
Elige una plantilla y pulsa **Emisión masiva** para emitir un certificado a cada participante activo inscrito como socio. Las plantillas se crean en la sección Certificados (capítulo 11).

### Importación CSV
Importa los participantes desde un archivo CSV:
1. descarga el formato de ejemplo;
2. pulsa **Generar vista previa**, que muestra las filas válidas, omitidas y los errores;
3. pulsa **Confirmar importación**.

## 3.4 Informe

El botón **Informe** descarga un PDF de resumen de la actividad: datos principales y número de participantes.
