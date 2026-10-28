# 7. Gestión de Inventario

Abre **Inventario** desde el grupo **Actividades** del menú lateral. Aquí registras los bienes y el equipamiento de la asociación y los préstamos a los socios.

## 7.1 Lista de artículos

Para cada artículo la tabla muestra:
- nombre y código de inventario;
- categoría;
- cantidad;
- estado.

**Buscar artículos...** filtra por nombre. Haz clic en una fila o en **Ver detalles** para abrir la ficha; las demás acciones son **Editar** y **Eliminar**.

## 7.2 Añadir un artículo

Pulsa **Añadir Artículo** y rellena:
- **Nombre del Artículo** (obligatorio) y **Código de inventario** (p. ej. INV-001).
- **Descripción**.
- **Categoría**: texto libre, tú eliges las categorías.
- **Cantidad** y **Ubicación**.
- **Método de Adquisición**: Compra, Donación, Préstamo o Desconocido.
- **Asignado a (ID de usuario)**: opcional, se introduce el número identificativo, no el nombre.
- **Valor actual** y **Años de depreciación**, opcionales.
- **Condición**: Nuevo, Bueno, Regular, Malo o Roto.
- **Estado**: Disponible, En Uso, Prestado, Perdido o Desechado.
- **Notas**.

Condición y estado son independientes: la primera describe el estado físico; el segundo, dónde está o cómo se usa el artículo.

### Compra
Con **Compra** aparecen **Precio de compra** y **Fecha de Compra**. Al crearlo, si el precio es mayor que cero, AssociaGo registra automáticamente un gasto en Finanzas con ese importe y la fecha de compra (o la fecha de hoy).

> El gasto solo se crea cuando añades el artículo: si después cambias el precio, la transacción no se actualiza.

### Valor y depreciación
El valor actual se recalcula a partir del precio de compra: si hay precio, fecha de compra y años de depreciación, se resta una cuota fija por cada año transcurrido hasta llegar a cero; si no, coincide con el precio de compra.

> El valor introducido a mano en **Valor actual** no se conserva: al leerlo se sustituye por el valor calculado.

Pulsa **Crear** (o **Actualizar** al editar).

## 7.3 Ficha de detalle

Arriba encuentras el botón **Editar** y tres indicadores: **Cantidad**, **Condición** y **Estado**. Debajo del nombre aparecen la categoría y la ubicación.

### Historial de préstamos
Pulsa **Registrar Préstamo** e indica:
- **Seleccionar Socio** (obligatorio);
- **Fecha de Préstamo** y **Fecha de Devolución Prevista**;
- **Condición en préstamo**: Nuevo, Bueno, Regular, Malo o Roto;
- **Notas**.

La tabla muestra **ID de Socio**, **Fecha de Préstamo**, **Fecha de Devolución** (o la fecha prevista seguida de "(Exp)" hasta que el artículo vuelve) y estado. En los préstamos en curso pulsa **Devolver** y confirma: se registra la fecha de hoy.

> Registrar o cerrar un préstamo no cambia el estado ni la cantidad del artículo: actualízalos a mano con **Editar**. La condición a la devolución no se registra.
