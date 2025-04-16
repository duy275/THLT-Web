import React, { useState, useEffect } from 'react';
import { Card, List, Space, Avatar, Statistic, Row, Col, Button, Modal, Divider } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';
import type { TravelPlan } from '@/models/travel/destination';
import { travelService } from '@/services/travel/travelService';
import styles from './style.less';

const PlansPage: React.FC = () => {
	const [plans, setPlans] = useState<TravelPlan[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		const savedPlans = travelService.getPlans();
		setPlans(savedPlans);
	}, []);

	const handleDelete = (planId: string) => {
		Modal.confirm({
			title: 'Xác nhận xóa',
			content: 'Bạn có chắc muốn xóa kế hoạch này?',
			onOk: () => {
				travelService.deletePlan(planId);
				setPlans(plans.filter((p) => p.id !== planId));
			},
		});
	};

	const getBudgetDistributionData = (plan: TravelPlan) => [
		{ type: 'Di chuyển', value: plan.budget.transport },
		{ type: 'Lưu trú', value: plan.budget.accommodation },
		{ type: 'Ăn uống', value: plan.budget.food },
		{ type: 'Điểm đến', value: plan.destinations.reduce((sum, d) => sum + (d.price || 0), 0) },
		{ type: 'Khác', value: plan.budget.extra },
	];

	return (
		<div className={styles.plansPage}>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card title='Thống kê chung'>
						<Row gutter={16}>
							<Col span={6}>
								<Statistic title='Tổng số kế hoạch' value={plans.length} />
							</Col>
							<Col span={6}>
								<Statistic
									title='Tổng chi phí'
									value={plans.reduce((sum, p) => sum + p.budget.total, 0)}
									formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
								/>
							</Col>
							<Col span={6}>
								<Statistic
									title='Chi phí trung bình'
									value={plans.length ? plans.reduce((sum, p) => sum + p.budget.total, 0) / plans.length : 0}
									formatter={(value) => `${Math.round(Number(value)).toLocaleString('vi-VN')}đ`}
								/>
							</Col>
							<Col span={6}>
								<Statistic title='Số điểm đến' value={plans.reduce((sum, p) => sum + p.destinations.length, 0)} />
							</Col>
						</Row>
					</Card>
				</Col>

				<Col span={12}>
					<Card title='Chi phí theo kế hoạch'>
						<Column
							data={plans.map((p) => ({
								name: p.name,
								value: p.budget.total,
							}))}
							xField='name'
							yField='value'
							label={{
								formatter: (v) => `${(v.value as number).toLocaleString('vi-VN')}đ`,
							}}
						/>
					</Card>
				</Col>

				<Col span={12}>
					<Card title='Điểm đến phổ biến'>
						<Pie
							data={plans
								.flatMap((p) => p.destinations)
								.reduce((acc, dest) => {
									const existing = acc.find((d) => d.type === dest.type);
									if (existing) {
										existing.value++;
									} else {
										acc.push({ type: dest.type, value: 1 });
									}
									return acc;
								}, [] as { type: string; value: number }[])}
							angleField='value'
							colorField='type'
						/>
					</Card>
				</Col>

				<Col span={24}>
					<Card title='Danh sách kế hoạch'>
						<List
							dataSource={plans}
							renderItem={(plan) => (
								<List.Item
									actions={[
										<Button
											icon={<EyeOutlined />}
											onClick={() => {
												setSelectedPlan(plan);
												setIsModalVisible(true);
											}}
										>
											Xem
										</Button>,
										<Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(plan.id)}>
											Xóa
										</Button>,
									]}
								>
									<List.Item.Meta
										title={plan.name}
										description={
											<Space direction='vertical'>
												<div>
													{new Date(plan.startDate).toLocaleDateString('vi-VN')}
													{' - '}
													{new Date(plan.endDate).toLocaleDateString('vi-VN')}
												</div>
												<div>{plan.destinations.length} điểm đến</div>
											</Space>
										}
									/>
									<div>{plan.budget.total.toLocaleString('vi-VN')}đ</div>
								</List.Item>
							)}
						/>
					</Card>
				</Col>
			</Row>

			<Modal
				title={selectedPlan?.name}
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={null}
				width={800}
			>
				{selectedPlan && (
					<Space direction='vertical' style={{ width: '100%' }}>
						<Row gutter={16}>
							<Col span={12}>
								<Statistic
									title='Tổng chi phí'
									value={selectedPlan.budget.total}
									formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title='Thời gian'
									value={`${new Date(selectedPlan.startDate).toLocaleDateString('vi-VN')} - ${new Date(
										selectedPlan.endDate,
									).toLocaleDateString('vi-VN')}`}
								/>
							</Col>
						</Row>

						<Divider>Phân bổ chi phí</Divider>
						<Pie
							data={getBudgetDistributionData(selectedPlan)}
							angleField='value'
							colorField='type'
							radius={0.8}
							label={{
								formatter: (datum) => `${datum.type}\n${datum.value.toLocaleString('vi-VN')}đ`,
							}}
						/>

						<Divider>Điểm đến</Divider>
						<List
							dataSource={selectedPlan.destinations}
							renderItem={(dest) => (
								<List.Item>
									<List.Item.Meta
										avatar={<Avatar src={dest.image} />}
										title={dest.name}
										description={`Loại: ${dest.type}`}
									/>
									<div>{dest.price?.toLocaleString('vi-VN')}đ</div>
								</List.Item>
							)}
						/>
					</Space>
				)}
			</Modal>
		</div>
	);
};

export default PlansPage;
