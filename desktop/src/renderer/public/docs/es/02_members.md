# 2. Gestión de Socios

La sección **Socios** contiene el registro de las personas inscritas en la asociación y sus inscripciones.

## 2.1 Lista de socios

La tabla muestra nombre, correo, rol, vencimiento y estado de cada socio.
- **Buscar socios...** filtra por nombre, apellido o correo.
- Las acciones de cada fila son **Editar**, **Renovar membresía** y **Eliminar**.
- En las asociaciones de tipo **ASD** aparece también el estado del certificado médico deportivo. En la parte superior de la lista, un aviso señala los certificados vencidos y los que vencen en los próximos 30 días.

## 2.2 Nuevo socio y edición

Pulsa **Añadir Socio**, o usa *Registrar Nuevo Socio* desde el Tablero o "Nuevo Socio" desde la búsqueda de funciones (<kbd>Ctrl</kbd>+<kbd>K</kbd>).

### Datos personales
- **Nombre**, **Apellido**, **Fecha de nacimiento** y **Sexo** son obligatorios.
- **Código catastral** es el código del municipio de nacimiento (p. ej. H501 para Roma).
- **Código Fiscal** es obligatorio. El botón **Calcular** lo obtiene a partir del nombre, apellido, fecha de nacimiento, sexo y código catastral.
- Contactos: **Correo**, **Teléfono**, **Dirección**, **Ciudad**, **Código postal**.

### Inscripción
- **Número de carné**: campo libre.
- **Fecha de registro (recepción del pago)**: obligatoria, no puede ser futura. Vale también como fecha del pago.
- **Tipo / Cargos**: puedes marcar más de uno (Socio ordinario, Socio fundador, Socio honorario, Presidente, Vicepresidente, Secretario, Tesorero, Consejero).

### Cuota de socio
Solo para un socio nuevo, **Registrar pago de la cuota de socio** crea también el ingreso en Finanzas:
- importe propuesto 20,00 €, modificable;
- método a elegir entre Efectivo, Transferencia Bancaria, TPV / Tarjeta y PayPal.

Al editar, la casilla no está disponible: los pagos posteriores se registran en Finanzas. El formato de carné y la cuota base de los Ajustes todavía no se aplican automáticamente en este formulario.

### Certificado médico deportivo (solo ASD)
La sección **Certificado Médico Deportivo** recoge:
- tipo (Agonístico o No Agonístico);
- fecha de expedición y de vencimiento;
- médico certificador, centro y notas.

## 2.3 Renovación y eliminación

- **Renovar membresía** pide confirmación y mueve el vencimiento a **un año a partir de hoy**. La renovación no registra pagos: la cuota se registra en Finanzas.
- **Eliminar** pide confirmación y elimina la inscripción del socio en esta asociación.

## 2.4 Importación y exportación CSV/JSON

Pulsa **Importar CSV** para abrir el panel **Importar/exportar socios**. Para cerrarlo usa **Ocultar importación CSV**.

1. **Ejemplo CSV** / **Ejemplo JSON** descargan un archivo de ejemplo con las columnas previstas.
2. **Exportar CSV** / **Exportar JSON** descargan todos los socios actuales.
3. Elige un archivo CSV o JSON y pulsa **Generar vista previa**. El resumen indica filas totales, válidas, duplicadas y errores.
4. **Confirmar importación** importa todas las filas válidas en una sola operación.

Reglas:
- si una fila no es válida, la importación se bloquea y no se escribe ningún dato;
- los socios ya presentes se omiten, sin sobrescribir datos;
- límite de 5000 filas y 5 MB por archivo;
- en la exportación CSV las celdas que empiezan por `=`, `+`, `-` o `@` se protegen, para que las hojas de cálculo no las ejecuten como fórmulas.

> El carné imprimible todavía no está disponible desde la interfaz.
