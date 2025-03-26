import React, { useState } from 'react';
import { Card, Button, Modal } from 'antd';
import CourseList from '../../components/Course/CourseList';
import CourseForm from '../../components/Course/CourseForm';
import { Course } from '../../models/course';
import { courseService } from '../../services/course/course';

const CoursePage: React.FC = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [courses, setCourses] = useState<Course[]>(courseService.getCourses());

	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const handleSubmit = (newCourse: Course) => {
		const updatedCourses = [...courses, newCourse];
		setCourses(updatedCourses);
		handleCancel();
	};

	return (
		<Card
			title='Quản Lý Khóa Học Online'
			extra={
				<Button type='primary' onClick={showModal}>
					Thêm Khóa Học
				</Button>
			}
		>
			<CourseList />

			<Modal title='Thêm Khóa Học Mới' visible={isModalVisible} footer={null} onCancel={handleCancel}>
				<CourseForm onSubmit={handleSubmit} />
			</Modal>
		</Card>
	);
};

export default CoursePage;
