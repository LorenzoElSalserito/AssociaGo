import React from 'react';
import { useTranslation } from 'react-i18next';

const AttendanceList = () => {
    const { t } = useTranslation();

    return (
        <div className="text-center p-5 text-muted">
            <p>{t('attendance.placeholder.list')}</p>
        </div>
    );
};

export default AttendanceList;
