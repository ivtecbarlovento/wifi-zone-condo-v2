// src/components/DeviceForm.js
import React, { useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Modal,
    Button
} from 'antd';

const { Option } = Select;

const DeviceForm = ({ 
    visible, 
    onCancel, 
    onSubmit, 
    initialValues = null, 
    title = "Add New Device" 
}) => {
    const [form] = Form.useForm();

    // Reset form when initialValues change
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleSubmit = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues || {}}
            >
                <Form.Item
                    name="nasname"
                    label="NAS IP Address"
                    rules={[{ required: true, message: 'Please input NAS IP Address!' }]}
                >
                    <Input placeholder="Enter NAS IP Address" />
                </Form.Item>

                <Form.Item
                    name="shortname"
                    label="Short Name"
                    rules={[{ required: true, message: 'Please input short name!' }]}
                >
                    <Input placeholder="Enter short name" />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Device Type"
                    rules={[{ required: true, message: 'Please select device type!' }]}
                >
                    <Select placeholder="Select device type">
                        <Option value="ubiquiti">Ubiquiti</Option>
                        <Option value="mikrotik">Mikrotik</Option>
                        <Option value="tplink">TP-Link</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="secret"
                    label="Secret"
                    rules={[{ required: true, message: 'Please input secret!' }]}
                >
                    <Input.Password placeholder="Enter secret" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {initialValues ? 'Update Device' : 'Add Device'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DeviceForm;