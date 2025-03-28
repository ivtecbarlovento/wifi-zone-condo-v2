// src/components/DeviceForm.js
import React from 'react';
import {
    Form,
    Input,
    Select,
    Modal,
    Button
} from 'antd';

const { Option } = Select;

const DeviceForm = ({ visible, onCancel, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal
            title="Add New Device"
            visible={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="nasname"
                    label="NAS Name"
                    rules={[{ required: true, message: 'Please input NAS name!' }]}
                >
                    <Input placeholder="Enter NAS name" />
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
                        <Option value="cisco">Cisco</Option>
                        <Option value="mikrotik">Mikrotik</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="nasipaddress"
                    label="IP Address"
                    rules={[
                        { required: true, message: 'Please input IP address!' },
                        {
                            pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                            message: 'Please enter a valid IP address!'
                        }
                    ]}
                >
                    <Input placeholder="Enter IP address" />
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
                        Add Device
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DeviceForm;