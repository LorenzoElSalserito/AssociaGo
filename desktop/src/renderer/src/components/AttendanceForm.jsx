import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const AttendanceForm = () => {
    const { t } = useTranslation();
    const { id } = useParams(); // Session ID
    const [searchParams] = useSearchParams();
    const activityId = searchParams.get('activityId');
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [sessionData, setSessionData] = useState({
        activityId: activityId,
        date: '',
        startTime: '',
        endTime: '',
        instructorId: '',
        notes: ''
    });

    const [records, setRecords] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            associago.getApiUrl().then(baseUrl => {
                // Fetch session details
                fetch(`${baseUrl}/attendance/session/${id}`)
                    .then(res => res.json())
                    .then(data => setSessionData(data))
                    .catch(err => console.error(err));

                // Fetch attendance records
                fetch(`${baseUrl}/attendance/session/${id}/records`)
                    .then(res => res.json())
                    .then(data => setRecords(data))
                    .catch(err => console.error(err));
            });
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSessionData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const baseUrl = await associago.getApiUrl();
        const url = isEditMode
            ? `${baseUrl}/attendance/session/${id}`
            : `${baseUrl}/attendance/session`;

        const method = isEditMode ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        })
        .then(res => res.json())
        .then(data => {
            if (!isEditMode) {
                navigate(`/attendance/session/${data.id}`);
            } else {
                alert(t('common.save') + ' OK'); // Simple feedback
            }
        })
        .catch(err => console.error(err));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6">{isEditMode ? t('attendance.manage') : t('attendance.new')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8 border-b pb-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('common.date')}</label>
                        <input
                            type="date"
                            name="date"
                            value={sessionData.date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('attendance.fields.startTime')}</label>
                        <input
                            type="time"
                            name="startTime"
                            value={sessionData.startTime}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('attendance.fields.endTime')}</label>
                        <input
                            type="time"
                            name="endTime"
                            value={sessionData.endTime}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {isEditMode ? t('common.update') : t('common.create')}
                </button>
            </form>

            {isEditMode && (
                <div>
                    <h3 className="text-xl font-bold mb-4">{t('attendance.title')}</h3>
                    {/* Qui andrebbe la lista dei partecipanti con checkbox per presenza */}
                    <p className="text-gray-500 italic">Participant list implementation pending...</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceForm;
