// src/pages/AccessDenied.js
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you don't have permission to access this page."
            extra={
                <Button type="primary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            }
        />
    );
};

export default AccessDenied;