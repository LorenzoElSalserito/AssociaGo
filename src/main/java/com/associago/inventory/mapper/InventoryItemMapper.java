package com.associago.inventory.mapper;

import com.associago.inventory.InventoryItem;
import com.associago.inventory.dto.InventoryItemCreateDTO;
import com.associago.inventory.dto.InventoryItemDTO;

public final class InventoryItemMapper {

    private InventoryItemMapper() {}

    public static InventoryItemDTO toDTO(InventoryItem item) {
        return new InventoryItemDTO(
                item.getId(),
                item.getAssociationId(),
                item.getInventoryCode(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getQuantity(),
                item.getLocation(),
                item.getAcquisitionMethod(),
                item.getPurchaseDate(),
                item.getPurchasePrice(),
                item.getCurrentValue(),
                item.getDepreciationYears(),
                item.getCondition(),
                item.getStatus(),
                item.getAssignedTo(),
                item.getPhotoPath(),
                item.getNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public static InventoryItem toEntity(InventoryItemCreateDTO dto) {
        InventoryItem item = new InventoryItem();
        item.setAssociationId(dto.associationId());
        item.setInventoryCode(dto.inventoryCode());
        item.setName(dto.name());
        item.setDescription(dto.description());
        item.setCategory(dto.category());
        item.setQuantity(dto.quantity());
        item.setLocation(dto.location());
        item.setAcquisitionMethod(dto.acquisitionMethod());
        item.setPurchaseDate(dto.purchaseDate());
        item.setPurchasePrice(dto.purchasePrice());
        item.setCurrentValue(dto.currentValue());
        item.setDepreciationYears(dto.depreciationYears());
        item.setCondition(dto.condition());
        item.setStatus(dto.status());
        item.setAssignedTo(dto.assignedTo());
        item.setPhotoPath(dto.photoPath());
        item.setNotes(dto.notes());
        return item;
    }

    public static void updateEntity(InventoryItem item, InventoryItemCreateDTO dto) {
        item.setAssociationId(dto.associationId());
        item.setInventoryCode(dto.inventoryCode());
        item.setName(dto.name());
        item.setDescription(dto.description());
        item.setCategory(dto.category());
        item.setQuantity(dto.quantity());
        item.setLocation(dto.location());
        item.setAcquisitionMethod(dto.acquisitionMethod());
        item.setPurchaseDate(dto.purchaseDate());
        item.setPurchasePrice(dto.purchasePrice());
        item.setCurrentValue(dto.currentValue());
        item.setDepreciationYears(dto.depreciationYears());
        item.setCondition(dto.condition());
        item.setStatus(dto.status());
        item.setAssignedTo(dto.assignedTo());
        item.setPhotoPath(dto.photoPath());
        item.setNotes(dto.notes());
    }
}
