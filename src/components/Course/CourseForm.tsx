import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { Course } from '../../models/course';
import { courseService } from '../../services/course/course';

const { Option } = Select;

interface CourseFormProps {
	onSubmit: (course: Course) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSubmit }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const instructors = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];
	const statuses: Course['status'][] = ['Đang mở', 'Đã kết thúc', 'Tạm dừng'];

	const handleSubmit = async (values: Course) => {
		setLoading(true);
		try {
			const courseData: Course = {
				...values,
				studentCount: 0,
				id: courseService.generateId(),
			};

			const success = courseService.addCourse(courseData);

			if (success) {
				message.success('Thêm khóa học thành công');
				onSubmit(courseData);
				form.resetFields();
			} else {
				message.error('Tên khóa học đã tồn tại');
			}
		} catch (error) {
			message.error('Có lỗi xảy ra');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form form={form} layout='vertical' initialValues={{ status: 'Đang mở' }} onFinish={handleSubmit}>
			<Form.Item
				name='name'
				label='Tên khóa học'
				rules={[
					{ required: true, message: 'Vui lòng nhập tên khóa học' },
					{ max: 100, message: 'Tên khóa học không được quá 100 ký tự' },
				]}
			>
				<Input placeholder='Nhập tên khóa học' />
			</Form.Item>

			<Form.Item name='instructor' label='Giảng viên' rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}>
				<Select placeholder='Chọn giảng viên'>
					{instructors.map((instructor) => (
						<Option key={instructor} value={instructor}>
							{instructor}
						</Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item name='description' label='Mô tả khóa học' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
				<Input.TextArea rows={4} placeholder='Nhập mô tả khóa học' />
			</Form.Item>

			<Form.Item name='status' label='Trạng thái' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
				<Select placeholder='Chọn trạng thái'>
					{statuses.map((status) => (
						<Option key={status} value={status}>
							{status}
						</Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item>
				<Button type='primary' htmlType='submit' loading={loading}>
					Thêm mới
				</Button>
			</Form.Item>
		</Form>
	);
};

export default CourseForm;
