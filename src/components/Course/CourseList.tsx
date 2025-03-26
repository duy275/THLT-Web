import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Popconfirm, message } from 'antd';
import { Course } from '../../models/course';
import { courseService } from '../../services/course/course';

const { Search } = Input;
const { Option } = Select;

type CourseStatus = Course['status'] | 'Tất cả';

interface CourseListProps {
	initialCourses?: Course[];
}

const CourseList: React.FC<CourseListProps> = ({ initialCourses = [] }) => {
	const [courses, setCourses] = useState<Course[]>(initialCourses);
	const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
	const [searchText, setSearchText] = useState('');
	const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<CourseStatus>('Tất cả');

	useEffect(() => {
		// Nếu không có initialCourses, load từ localStorage
		if (initialCourses.length === 0) {
			const loadedCourses = courseService.getCourses();
			setCourses(loadedCourses);
		}
	}, []);

	const instructors = ['Tất cả', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];
	const statuses: CourseStatus[] = ['Tất cả', 'Đang mở', 'Đã kết thúc', 'Tạm dừng'];

	useEffect(() => {
		filterCourses();
	}, [courses, searchText, instructorFilter, statusFilter]);

	const filterCourses = () => {
		let result = [...courses];

		if (searchText) {
			result = result.filter((course) => course.name.toLowerCase().includes(searchText.toLowerCase()));
		}

		if (instructorFilter && instructorFilter !== 'Tất cả') {
			result = result.filter((course) => course.instructor === instructorFilter);
		}

		if (statusFilter && statusFilter !== 'Tất cả') {
			result = result.filter((course) => course.status === statusFilter);
		}

		// Sắp xếp theo số lượng học viên giảm dần
		result.sort((a, b) => b.studentCount - a.studentCount);

		setFilteredCourses(result);
	};

	const handleDelete = (courseId: string) => {
		const success = courseService.deleteCourse(courseId);
		if (success) {
			const updatedCourses = courses.filter((course) => course.id !== courseId);
			setCourses(updatedCourses);
			message.success('Xóa khóa học thành công');
		} else {
			message.error('Không thể xóa khóa học có học viên');
		}
	};

	const columns = [
		{
			title: 'Tên khóa học',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Giảng viên',
			dataIndex: 'instructor',
			key: 'instructor',
		},
		{
			title: 'Số lượng học viên',
			dataIndex: 'studentCount',
			key: 'studentCount',
			sorter: (a: Course, b: Course) => a.studentCount - b.studentCount,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (course: Course) => (
				<Popconfirm title='Bạn có chắc muốn xóa?' onConfirm={() => handleDelete(course.id!)}>
					<Button danger type='link'>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
				<Search placeholder='Tìm kiếm khóa học' onSearch={setSearchText} style={{ width: 200 }} />
				<Select
					style={{ width: 150 }}
					placeholder='Giảng viên'
					onChange={(value: string) => setInstructorFilter(value)}
				>
					{instructors.map((instructor) => (
						<Option key={instructor} value={instructor}>
							{instructor}
						</Option>
					))}
				</Select>
				<Select
					style={{ width: 150 }}
					placeholder='Trạng thái'
					defaultValue='Tất cả'
					onChange={(value: CourseStatus) => setStatusFilter(value)}
				>
					{statuses.map((status) => (
						<Option key={status} value={status}>
							{status}
						</Option>
					))}
				</Select>
			</div>
			<Table columns={columns} dataSource={filteredCourses} rowKey='id' />
		</div>
	);
};

export default CourseList;
