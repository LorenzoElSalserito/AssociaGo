import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Package, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import InventoryDetail from './InventoryDetail';

const InventoryList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemId, setSelectedItemId] = useState(null);

    useEffect(() => {
        if (associationId) {
            fetchInventory();
        }
    }, [associationId]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await associago.inventory.getAll();
            setItems(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this item?'))) return;
        try {
            await associago.inventory.delete(id);
            fetchInventory();
        } catch (error) {
            alert(t('Error deleting item'));
        }
    };

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER DETAIL VIEW ---
    if (selectedItemId) {
        return (
            <InventoryDetail
                itemId={selectedItemId}
                shell={shell}
                onBack={() => {
                    setSelectedItemId(null);
                    fetchInventory();
                }}
            />
        );
    }

    // --- RENDER LIST VIEW ---
    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Inventory')}</h2>
                    <p className="text-muted mb-0">{t('Manage assets and equipment')}</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center" onClick={() => shell.openModal('inventory-form', { associationId, onSuccess: fetchInventory })}>
                    <Plus size={18} className="me-2" />
                    {t('Add Item')}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2" style={{ width: '300px' }}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <Search size={16} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder={t('Search items...')}
                                    className="bg-light border-start-0 ps-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Item Name')}</th>
                                    <th className="border-0">{t('Category')}</th>
                                    <th className="border-0">{t('Quantity')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length > 0 ? (
                                    filteredItems.map(item => (
                                        <tr key={item.id} style={{cursor: 'pointer'}} onClick={() => setSelectedItemId(item.id)}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{item.name}</div>
                                                        <div className="small text-muted">{item.inventoryCode}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.category}</td>
                                            <td>
                                                <Badge bg="light" className="text-dark border">
                                                    {item.quantity}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={item.status === 'AVAILABLE' ? 'success' : 'warning'} className="fw-normal px-2 py-1">
                                                    {t(item.status)}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" className="btn-icon text-primary" onClick={() => setSelectedItemId(item.id)}>
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-muted" onClick={() => shell.openModal('inventory-form', { associationId, itemId: item.id, onSuccess: fetchInventory })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-danger" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            {t('No items found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default InventoryList;
