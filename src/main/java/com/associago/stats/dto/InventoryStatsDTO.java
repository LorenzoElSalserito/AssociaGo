package com.associago.stats.dto;

import java.math.BigDecimal;
import java.util.Map;

public class InventoryStatsDTO {
    private int totalItems;
    private BigDecimal totalValue;
    private BigDecimal depreciatedValue;
    private int itemsInUse;
    private int itemsAvailable;
    private int itemsLost;
    private Map<String, Integer> itemsByCategory;

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public BigDecimal getDepreciatedValue() { return depreciatedValue; }
    public void setDepreciatedValue(BigDecimal depreciatedValue) { this.depreciatedValue = depreciatedValue; }
    public int getItemsInUse() { return itemsInUse; }
    public void setItemsInUse(int itemsInUse) { this.itemsInUse = itemsInUse; }
    public int getItemsAvailable() { return itemsAvailable; }
    public void setItemsAvailable(int itemsAvailable) { this.itemsAvailable = itemsAvailable; }
    public int getItemsLost() { return itemsLost; }
    public void setItemsLost(int itemsLost) { this.itemsLost = itemsLost; }
    public Map<String, Integer> getItemsByCategory() { return itemsByCategory; }
    public void setItemsByCategory(Map<String, Integer> itemsByCategory) { this.itemsByCategory = itemsByCategory; }
}
