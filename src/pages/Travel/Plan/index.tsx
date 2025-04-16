import React, { useState, useEffect } from 'react';
import {
	Card,
	Button,
	DatePicker,
	Space,
	Input,
	InputNumber,
	Modal,
	List,
	Avatar,
	Statistic,
	Alert,
	notification,
	Tooltip,
	Progress,
} from 'antd';
import { PlusOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { Destination } from '@/models/travel/destination';
import type { TravelPlan } from '@/models/travel/destination'; // Ensure this path points to where TravelPlan is defined
import type { RangeValue } from 'rc-picker/lib/interface';
import type { Moment } from 'moment';
import { travelService } from '@/services/travel/travelService';
import styles from './style.less';

const { RangePicker } = DatePicker;

const DAILY_FOOD_COST = 300000; // 300k VND per day
const DEFAULT_BUDGET = 20000000; // Default 20M VND

// Update the DayPlan interface to include more details
interface DayPlan {
	day: number;
	destinations: Destination[];
	date: Date;
}

const PlanPage: React.FC = () => {
	const [planName, setPlanName] = useState('');
	const [selectedDates, setSelectedDates] = useState<[Date, Date] | undefined>();
	const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([]);
	const [dailyPlans, setDailyPlans] = useState<DayPlan[]>([]);
	const [foodCost, setFoodCost] = useState<number>(0);
	const [budgetLimit, setBudgetLimit] = useState<number>(DEFAULT_BUDGET);

	// Budget states
	const [transportCost, setTransportCost] = useState<number>(0);
	const [accommodationCost, setAccommodationCost] = useState<number>(0);
	const [extraCost, setExtraCost] = useState<number>(0);

	// Sửa lại useEffect load destinations
	useEffect(() => {
		const data = travelService.getDestinations();
		if (data && data.length > 0) {
			setAvailableDestinations(data);
		} else {
			notification.error({
				message: 'Lỗi',
				description: 'Không thể tải danh sách điểm đến',
			});
		}
	}, []);

	useEffect(() => {
		const duration = calculateDuration();
		setFoodCost(duration * DAILY_FOOD_COST);
	}, [selectedDates]);

	useEffect(() => {
		const totalBudget = calculateTotalBudget();
		if (totalBudget > budgetLimit) {
			notification.warning({
				message: 'Cảnh báo vượt ngân sách',
				description: `Chi phí dự kiến (${totalBudget.toLocaleString(
					'vi-VN',
				)}đ) đã vượt quá ngân sách (${budgetLimit.toLocaleString('vi-VN')}đ)`,
				duration: 0,
			});
		}
	}, [transportCost, accommodationCost, extraCost, selectedDestinations, budgetLimit]);

	// Update the useEffect for daily plans creation
	useEffect(() => {
		if (selectedDates) {
			const duration = calculateDuration();
			const newDailyPlans = Array.from({ length: duration }, (_, i) => {
				const currentDate = new Date(selectedDates[0]);
				currentDate.setDate(selectedDates[0].getDate() + i);
				return {
					day: i + 1,
					destinations: [],
					date: new Date(currentDate),
				};
			});
			setDailyPlans(newDailyPlans);
		} else {
			setDailyPlans([]);
		}
	}, [selectedDates]);

	const calculateTotalBudget = () => {
		const destinationsCost = selectedDestinations.reduce((total, dest) => total + (dest.price || 0), 0);
		return destinationsCost + transportCost + accommodationCost + extraCost + foodCost;
	};

	const calculateDuration = () => {
		if (!selectedDates) return 0;
		const diffTime = selectedDates[1].getTime() - selectedDates[0].getTime();
		// Thêm 1 vào kết quả vì cần tính cả ngày bắt đầu
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
	};

	const handleDateChange = (dates: RangeValue<Moment>) => {
		if (dates && dates[0] && dates[1]) {
			const startDate = dates[0].toDate();
			const endDate = dates[1].toDate();
			setSelectedDates([startDate, endDate]);

			// Thêm 1 vào số ngày để tính cả ngày bắt đầu
			const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			setAccommodationCost(days * 500000); // 500k per day
		} else {
			setSelectedDates(undefined);
			setAccommodationCost(0);
		}
	};

	// Thêm hàm xử lý thêm điểm đến
	const handleAddDestination = (destination: Destination) => {
		if (selectedDestinations.find((d) => d.id === destination.id)) {
			notification.warning({
				message: 'Điểm đến đã được chọn',
				description: 'Vui lòng chọn điểm đến khác',
			});
			return;
		}
		setSelectedDestinations((prev) => [...prev, destination]);
		setIsModalVisible(false);
	};

	const handleRemoveDestination = (index: number) => {
		setSelectedDestinations((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSavePlan = () => {
		if (!planName || !selectedDates || selectedDestinations.length === 0) {
			notification.warning({
				message: 'Thông tin chưa đầy đủ',
				description: 'Vui lòng điền đầy đủ tên chuyến đi, ngày đi và chọn ít nhất một điểm đến',
			});
			return;
		}

		const newPlan: TravelPlan = {
			id: Date.now().toString(),
			name: planName,
			startDate: selectedDates[0],
			endDate: selectedDates[1],
			destinations: selectedDestinations,
			budget: {
				total: calculateTotalBudget(),
				transport: transportCost,
				accommodation: accommodationCost,
				food: foodCost,
				extra: extraCost,
			},
			createdAt: new Date(),
		};

		try {
			travelService.savePlan(newPlan);
			notification.success({
				message: 'Lưu kế hoạch thành công',
				description: 'Kế hoạch du lịch đã được lưu',
			});
			// Reset form
			setPlanName('');
			setSelectedDates(undefined);
			setSelectedDestinations([]);
			setTransportCost(0);
			setAccommodationCost(0);
			setExtraCost(0);
			setFoodCost(0);
		} catch (error) {
			notification.error({
				message: 'Lỗi',
				description: 'Không thể lưu kế hoạch. Vui lòng thử lại',
			});
		}
	};

	// Update handleDragEnd to work with the new structure
	const handleDragEnd = (result: any) => {
		if (!result.destination) return;

		const sourceDay = parseInt(result.source.droppableId);
		const destDay = parseInt(result.destination.droppableId);

		const newDailyPlans = [...dailyPlans];
		const sourcePlan = newDailyPlans.find((p) => p.day === sourceDay);
		const destPlan = newDailyPlans.find((p) => p.day === destDay);

		if (sourcePlan && destPlan) {
			const [movedDest] = selectedDestinations.filter((d) => sourcePlan.destinations.find((sd) => sd.id === d.id));

			if (movedDest) {
				sourcePlan.destinations = sourcePlan.destinations.filter((d) => d.id !== movedDest.id);
				destPlan.destinations.splice(result.destination.index, 0, movedDest);
			}
		}

		setDailyPlans(newDailyPlans);
	};

	// Thêm hàm xử lý mở modal
	const showDestinationModal = () => {
		if (availableDestinations.length === 0) {
			notification.warning({
				message: 'Không có điểm đến',
				description: 'Vui lòng thêm điểm đến trong trang Admin trước',
			});
			return;
		}
		setIsModalVisible(true);
	};

	return (
		<Card
			title='Lập Kế Hoạch Du Lịch'
			extra={
				<Button type='primary' onClick={handleSavePlan}>
					Lưu kế hoạch
				</Button>
			}
		>
			<Space direction='vertical' style={{ width: '100%' }} size='large'>
				<Input placeholder='Tên chuyến đi' value={planName} onChange={(e) => setPlanName(e.target.value)} />

				<RangePicker onChange={handleDateChange} />

				{/* Add Budget Input */}
				<Input.Group compact>
					<InputNumber
						style={{ width: 'calc(100% - 100px)' }}
						prefix={<DollarOutlined />}
						addonBefore='Ngân sách'
						min={0}
						value={budgetLimit}
						onChange={(value) => setBudgetLimit(value || 0)}
						formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
					/>
					<Tooltip title='Đặt lại ngân sách mặc định'>
						<Button onClick={() => setBudgetLimit(DEFAULT_BUDGET)} icon={<ReloadOutlined />}>
							Mặc định
						</Button>
					</Tooltip>
				</Input.Group>

				{/* Budget Progress */}
				<Card size='small'>
					<Progress
						percent={Math.min((calculateTotalBudget() / budgetLimit) * 100, 100)}
						status={calculateTotalBudget() > budgetLimit ? 'exception' : 'active'}
						format={() => (
							<span>
								{calculateTotalBudget().toLocaleString('vi-VN')}đ
								<br />
								<small>/{budgetLimit.toLocaleString('vi-VN')}đ</small>
							</span>
						)}
					/>
				</Card>

				{/* Sửa lại nút thêm điểm đến */}
				<Button type='dashed' icon={<PlusOutlined />} onClick={showDestinationModal} block>
					Thêm điểm đến
				</Button>

				<div className={styles.budgetSection}>
					<Card title='Chi phí dự kiến' size='small'>
						<Space direction='vertical' style={{ width: '100%' }}>
							<Input.Group compact>
								<Input
									prefix={<DollarOutlined />}
									addonBefore='Chi phí di chuyển'
									type='number'
									value={transportCost}
									onChange={(e) => setTransportCost(Number(e.target.value))}
									style={{ width: '50%' }}
								/>
								<Input
									prefix={<DollarOutlined />}
									addonBefore='Chi phí phát sinh'
									type='number'
									value={extraCost}
									onChange={(e) => setExtraCost(Number(e.target.value))}
									style={{ width: '50%' }}
								/>
							</Input.Group>

							<Alert
								message='Thông tin chuyến đi'
								description={
									<Space direction='vertical'>
										<div>Số ngày: {calculateDuration()} ngày</div>
										<div>Chi phí lưu trú: {accommodationCost.toLocaleString('vi-VN')}đ</div>
										<div>
											Tổng chi phí điểm đến:{' '}
											{selectedDestinations
												.reduce((total, dest) => total + (dest.price || 0), 0)
												.toLocaleString('vi-VN')}
											đ
										</div>
									</Space>
								}
								type='info'
							/>

							<Card>
								<Statistic
									title='Tổng chi phí dự kiến'
									value={calculateTotalBudget()}
									precision={0}
									suffix='đ'
									formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								/>
							</Card>
						</Space>
						<Alert
							message='Thông tin chi phí'
							description={
								<Space direction='vertical' style={{ width: '100%' }}>
									<div>
										Ngân sách còn lại: {Math.max(budgetLimit - calculateTotalBudget(), 0).toLocaleString('vi-VN')}đ
									</div>
									{calculateTotalBudget() > budgetLimit && (
										<div style={{ color: '#ff4d4f' }}>
											Vượt ngân sách: {(calculateTotalBudget() - budgetLimit).toLocaleString('vi-VN')}đ
										</div>
									)}
								</Space>
							}
							type={calculateTotalBudget() > budgetLimit ? 'warning' : 'success'}
						/>
					</Card>
				</div>

				<Card title='Điểm đến đã chọn' size='small'>
					<List
						dataSource={selectedDestinations}
						renderItem={(item, index) => (
							<List.Item
								actions={[
									<Button type='link' danger onClick={() => handleRemoveDestination(index)}>
										Xóa
									</Button>,
								]}
							>
								<List.Item.Meta
									avatar={<Avatar src={item.image} />}
									title={item.name}
									description={`${item.price?.toLocaleString('vi-VN')}đ`}
								/>
							</List.Item>
						)}
					/>
				</Card>

				<DragDropContext onDragEnd={handleDragEnd}>
					<div className={styles.daysContainer}>
						{dailyPlans.map((dayPlan) => (
							<Card
								key={dayPlan.day}
								title={
									<Space direction='vertical' size='small'>
										<div>Ngày {dayPlan.day}</div>
										<small>{dayPlan.date.toLocaleDateString('vi-VN')}</small>
									</Space>
								}
								className={styles.dayCard}
								size='small'
							>
								<Droppable droppableId={dayPlan.day.toString()}>
									{(provided) => (
										<div ref={provided.innerRef} {...provided.droppableProps} className={styles.dropZone}>
											{dayPlan.destinations.map((dest, index) => (
												<Draggable key={dest.id} draggableId={dest.id} index={index}>
													{(provided) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															className={styles.destinationCard}
														>
															<Card size='small'>
																<Space>
																	<Avatar src={dest.image} />
																	<div>
																		<h4>{dest.name}</h4>
																		<div>{dest.price?.toLocaleString('vi-VN')}đ</div>
																	</div>
																</Space>
															</Card>
														</div>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</Card>
						))}
					</div>
				</DragDropContext>
			</Space>

			<Modal
				title='Chọn điểm đến'
				visible={isModalVisible} // Use 'visible' instead of 'open'
				onCancel={() => setIsModalVisible(false)}
				footer={null}
				width={600}
			>
				<List
					itemLayout='horizontal'
					dataSource={availableDestinations}
					renderItem={(item) => (
						<List.Item
							actions={[
								<Button type='primary' onClick={() => handleAddDestination(item)}>
									Thêm
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={<Avatar src={item.image} />}
								title={item.name}
								description={
									<Space direction='vertical'>
										<div>Loại: {item.type}</div>
										<div>Đánh giá: {item.rating}/5</div>
										<div>Giá: {item.price?.toLocaleString('vi-VN')}đ</div>
									</Space>
								}
							/>
						</List.Item>
					)}
				/>
			</Modal>
		</Card>
	);
};

export default PlanPage;
