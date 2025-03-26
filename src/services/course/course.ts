import { Course } from '../../models/course';

const LOCAL_STORAGE_KEY = 'courses';

export const courseService = {
	// Lấy danh sách khóa học
	getCourses(): Course[] {
		const coursesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
		return coursesJson ? JSON.parse(coursesJson) : [];
	},

	// Sinh ID ngẫu nhiên
	generateId(): string {
		return Math.random().toString(36).substr(2, 9);
	},

	// Thêm khóa học
	addCourse(course: Course): boolean {
		const courses = this.getCourses();

		// Kiểm tra trùng tên
		if (courses.some((c) => c.name === course.name)) {
			return false;
		}

		const newCourse = { ...course, id: this.generateId() };
		courses.push(newCourse);
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(courses));
		return true;
	},

	// Cập nhật khóa học
	updateCourse(updatedCourse: Course): boolean {
		const courses = this.getCourses();
		const index = courses.findIndex((c) => c.id === updatedCourse.id);

		if (index === -1) return false;

		// Kiểm tra trùng tên (trừ chính khóa học đang sửa)
		if (courses.some((c) => c.name === updatedCourse.name && c.id !== updatedCourse.id)) {
			return false;
		}

		courses[index] = updatedCourse;
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(courses));
		return true;
	},

	// Xóa khóa học
	deleteCourse(courseId: string): boolean {
		const courses = this.getCourses();
		const courseToDelete = courses.find((c) => c.id === courseId);

		// Kiểm tra điều kiện xóa (chưa có học viên)
		if (courseToDelete && courseToDelete.studentCount === 0) {
			const filteredCourses = courses.filter((c) => c.id !== courseId);
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredCourses));
			return true;
		}

		return false;
	},
};
