import React, { useState } from 'react';
import {
	Card,
	Table,
	Button,
	Space,
	Upload,
	Image,
	Modal,
	Form,
	Input,
	Select,
	Rate,
	InputNumber,
	message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Destination } from '@/models/travel/destination';
import { travelService } from '@/services/travel/travelService';
import styles from './style.less';

const { Option } = Select;

const AdminPage: React.FC = () => {
	const [destinations, setDestinations] = useState<Destination[]>(travelService.getDestinations());
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleAdd = () => {
		setEditingDestination(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEdit = (record: Destination) => {
		setEditingDestination(record);
		form.setFieldsValue(record);
		setIsModalVisible(true);
	};

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: 'Xác nhận xóa',
			content: 'Bạn có chắc chắn muốn xóa điểm đến này?',
			onOk: () => {
				const newDestinations = destinations.filter((item) => item.id !== id);
				setDestinations(newDestinations);
				travelService.updateDestinations(newDestinations);
				message.success('Đã xóa điểm đến');
			},
		});
	};

	const handleSubmit = (values: any) => {
		const newDestination: Destination = {
			...values,
			id: editingDestination?.id || Date.now().toString(),
			image: fileList[0]?.thumbUrl || editingDestination?.image || '',
			price: Number(values.price),
			rating: Number(values.rating),
		};

		if (editingDestination) {
			const newDestinations = destinations.map((item) => (item.id === editingDestination.id ? newDestination : item));
			setDestinations(newDestinations);
			travelService.updateDestinations(newDestinations);
		} else {
			const newDestinations = [...destinations, newDestination];
			setDestinations(newDestinations);
			travelService.updateDestinations(newDestinations);
		}

		setFileList([]);
		setIsModalVisible(false);
		form.resetFields();
	};

	const columns: ColumnsType<Destination> = [
		{
			title: 'Hình ảnh',
			dataIndex: 'image',
			key: 'image',
			render: (image: string) => <Image src={image} width={100} />,
		},
		{
			title: 'Tên điểm đến',
			dataIndex: 'name',
			key: 'name',
			sorter: (a: Destination, b: Destination) => a.name.localeCompare(b.name),
		},
		{
			title: 'Loại hình',
			dataIndex: 'type',
			key: 'type',
			filters: [
				{ text: 'Biển', value: 'beach' },
				{ text: 'Núi', value: 'mountain' },
				{ text: 'Thành phố', value: 'city' },
			],
			onFilter: (value: string | number | boolean, record: Destination) => record.type === value.toString(),
		},
		{
			title: 'Đánh giá',
			dataIndex: 'rating',
			key: 'rating',
			render: (rating: number) => <Rate disabled defaultValue={rating} />,
			sorter: (a: Destination, b: Destination) => a.rating - b.rating,
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, record: Destination) => (
				<Space>
					<Button type='primary' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<div className={styles.adminPage}>
			<Card
				title='Quản Lý Điểm Đến'
				extra={
					<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
						Thêm điểm đến
					</Button>
				}
			>
				<Table columns={columns} dataSource={destinations} rowKey='id' pagination={{ pageSize: 10 }} />

				<Modal
					title={editingDestination ? 'Sửa điểm đến' : 'Thêm điểm đến mới'}
					visible={isModalVisible}
					onCancel={() => {
						setIsModalVisible(false);
						setFileList([]);
						form.resetFields();
					}}
					footer={null}
				>
					<Form form={form} layout='vertical' onFinish={handleSubmit} initialValues={editingDestination || undefined}>
						<Form.Item
							name='name'
							label='Tên điểm đến'
							rules={[{ required: true, message: 'Vui lòng nhập tên điểm đến' }]}
						>
							<Input />
						</Form.Item>

						<Form.Item name='type' label='Loại hình' rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}>
							<Select>
								<Option value='beach'>Biển</Option>
								<Option value='mountain'>Núi</Option>
								<Option value='city'>Thành phố</Option>
							</Select>
						</Form.Item>

						<Form.Item name='rating' label='Đánh giá' rules={[{ required: true, message: 'Vui lòng đánh giá' }]}>
							<Rate allowHalf />
						</Form.Item>

						<Form.Item name='price' label='Giá' rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
							<InputNumber
								style={{ width: '100%' }}
								formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								parser={(value) => (value ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : 0)}
								min={0}
							/>
						</Form.Item>

						<Form.Item label='Hình ảnh' required>
							<Upload
								listType='picture-card'
								fileList={fileList}
								maxCount={1}
								beforeUpload={(file) => {
									const isImage = file.type.startsWith('image/');
									if (!isImage) {
										message.error('Chỉ được tải lên file ảnh!');
										return false;
									}
									return false; // Return false to handle upload manually
								}}
								onChange={({ fileList: newFileList }) => {
									setFileList(newFileList);
								}}
							>
								{fileList.length < 1 && (
									<div>
										<UploadOutlined />
										<div style={{ marginTop: 8 }}>Tải ảnh</div>
									</div>
								)}
							</Upload>
						</Form.Item>

						<Form.Item name='description' label='Mô tả'>
							<Input.TextArea rows={4} />
						</Form.Item>

						<Form.Item>
							<Button type='primary' htmlType='submit'>
								{editingDestination ? 'Cập nhật' : 'Thêm mới'}
							</Button>
						</Form.Item>
					</Form>
				</Modal>
			</Card>
		</div>
	);
};

export default AdminPage;
