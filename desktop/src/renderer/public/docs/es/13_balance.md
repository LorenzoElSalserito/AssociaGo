# 13. Balance Anual

La página **Balance Anual** calcula la rendición de cuentas de un año a partir de los movimientos registrados en la contabilidad.

## 13.1 Lista de balances

La tabla muestra **Año**, **Título**, **Estado** y **Resultado neto** (verde si es positivo, rojo si es negativo). Haz clic en una fila para abrir el balance. El icono de la **papelera** lo elimina, tras la confirmación **¿Estás seguro?**.

## 13.2 Calcular un balance

1. Pulsa **Calcular balance**.
2. En la ventana **Calcular balance anual** indica el **Año**.
3. Pulsa **Calcular**.

El sistema toma los movimientos del 1 de enero al 31 de diciembre, los agrupa por categoría (los que no tienen categoría van a "Otros ingresos" u "Otros gastos") y crea el balance "Balance anual AÑO". El título y las partidas genéricas se escriben en el idioma de la interfaz en el momento del cálculo.

> Si para ese año ya existe un balance, se recalcula y se sobrescribe, aunque estuviera aprobado, y vuelve a un estado no aprobado.

## 13.3 Detalle

Arriba hay tres recuadros: **Ingresos Totales**, **Gastos Totales** y **Resultado neto**. Debajo, dos tablas, **Ingresos** y **Gastos**, con una fila por categoría y el total en negrita (TOTAL DE INGRESOS, TOTAL DE GASTOS).

> La comparación con el año anterior se calcula, pero no se muestra ni en la página ni en el PDF.

## 13.4 Firmantes

Al abrirlo, el sistema comprueba por sí solo que **Presidente**, **Secretario** y **Tesorero** tengan un nombre en **Ajustes › Firmas** o en el **Organigrama** (**Ajustes › Perfil de la Asociación**). Si falta alguno aparece el aviso **Firmantes faltantes** seguido de los roles en forma de código inglés (president, secretary, treasurer).

## 13.5 Aprobación

**Aprobar** pasa el balance al estado aprobado. Sigue desactivado mientras falte aunque sea uno de los tres firmantes; tras la aprobación desaparece.

> La aprobación no hace inmutable el balance: todavía se puede eliminar o recalcular.

## 13.6 PDF

**Descargar PDF** está disponible en cualquier estado, también antes de la aprobación, y guarda el archivo `bilancio_ANNO.pdf` en formato A4, en el idioma de la interfaz (etiquetas, fechas e importes). Contiene:
- nombre, dirección, ciudad y código fiscal de la asociación;
- título "BALANCE ANUAL AÑO" y periodo;
- ingresos y gastos por categoría con los totales;
- "SUPERÁVIT" o "DÉFICIT", fondo inicial y final;
- sección "Firmas" para Presidente, Secretario y Tesorero: imagen de la firma de **Ajustes › Firmas** (capítulo 16), nombre y cargo; sin firma guardada, el nombre del Organigrama y una línea vacía;
- fecha y hora de generación y número de página.

> El PDF no contiene logotipo ni fecha de aprobación.

En cada descarga se calcula una suma de comprobación SHA-256 del PDF. Las primeras 16 cifras aparecen junto al estado después de salir de la página y volver a abrirla.

> **Nota**: el balance anual es obligatorio para las entidades del Tercer Sector y debe aprobarlo la asamblea en los plazos legales (normalmente antes del 30 de abril del año siguiente).
