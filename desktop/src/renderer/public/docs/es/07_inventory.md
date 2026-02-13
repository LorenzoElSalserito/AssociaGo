# 7. Gestión de Inventario (Inventory)

La sección **Inventario** sirve para rastrear los bienes materiales de la asociación.

## 7.1 Lista de Artículos
Enumera todos los bienes, con cantidad, valor y estado.

## 7.2 Añadir Artículo
El formulario permite introducir:
- **Nombre y Código de Inventario**.
- **Categoría**: (Electrónica, Mobiliario, Deporte, etc.).
- **Cantidad y Valor**.
- **Estado**: (Nuevo, Bueno, Roto, Desechado).
- **Método de Adquisición**: (Compra, Donación, Préstamo).
    - *Nota*: Si se selecciona "Compra", el sistema propone crear automáticamente la transacción de gasto.

## 7.3 Préstamos (Loans)
Desde la ficha de un artículo, es posible gestionar los préstamos a los socios:
- **Registrar Préstamo**: Selecciona el socio y la fecha.
- **Devolución**: Marca el artículo como devuelto y actualiza la disponibilidad.
- **Historial**: Visualiza todos los movimientos del artículo.
