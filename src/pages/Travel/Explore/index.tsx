import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Rate, Select, InputNumber, Space, Input } from 'antd';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import type { Destination } from '@/models/travel/destination';
import { travelService } from '@/services/travel/travelService';
import styles from './style.less';

const { Meta } = Card;
const { Option } = Select;

const ExplorePage: React.FC = () => {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
	const [ratingFilter, setRatingFilter] = useState<number>(0);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		const data = travelService.getDestinations() || [];
		setDestinations(data);
		setFilteredDestinations(data);
	}, []);

	// Tách hàm lọc thành các hàm nhỏ hơn
	const filterBySearch = (items: Destination[]) => {
		if (!searchQuery) return items;
		return items.filter(
			(d) =>
				d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				d.description?.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	};

	const filterByType = (items: Destination[]) => {
		if (typeFilter === 'all') return items;
		return items.filter((d) => d.type === typeFilter);
	};

	const filterByPrice = (items: Destination[]) => {
		return items.filter((d) => d.price >= priceRange[0] && d.price <= priceRange[1]);
	};

	const filterByRating = (items: Destination[]) => {
		if (!ratingFilter) return items;
		return items.filter((d) => (d.rating || 0) >= ratingFilter);
	};

	// Áp dụng tất cả các bộ lọc
	const applyFilters = () => {
		let result = [...destinations];
		result = filterBySearch(result);
		result = filterByType(result);
		result = filterByPrice(result);
		result = filterByRating(result);
		setFilteredDestinations(result);
	};

	// Cập nhật lọc khi các điều kiện thay đổi
	useEffect(() => {
		applyFilters();
	}, [searchQuery, typeFilter, priceRange, ratingFilter]);

	return (
		<div className={styles.explorePage}>
			<Card title='Khám phá điểm đến'>
				<Space direction='vertical' size='large' style={{ width: '100%' }}>
					{/* Thanh tìm kiếm */}
					<Input
						placeholder='Tìm kiếm điểm đến...'
						prefix={<SearchOutlined />}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{ maxWidth: 400 }}
					/>

					{/* Bộ lọc */}
					<Space wrap className={styles.filterGroup}>
						<Select
							style={{ width: 200 }}
							placeholder='Loại hình du lịch'
							value={typeFilter}
							onChange={(value) => setTypeFilter(value)}
						>
							<Option value='all'>Tất cả</Option>
							<Option value='beach'>Biển</Option>
							<Option value='mountain'>Núi</Option>
							<Option value='city'>Thành phố</Option>
						</Select>

						<Space>
							<InputNumber
								style={{ width: 120 }}
								placeholder='Giá từ'
								value={priceRange[0]}
								formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
								onChange={(val) => setPriceRange([val || 0, priceRange[1]])}
							/>
							<InputNumber
								style={{ width: 120 }}
								placeholder='Đến'
								value={priceRange[1]}
								formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
								onChange={(val) => setPriceRange([priceRange[0], val || 0])}
							/>
						</Space>

						<div className={styles.ratingFilter}>
							<span className={styles.ratingLabel}>
								<StarOutlined /> Đánh giá từ:
							</span>
							<Rate
								allowHalf
								value={ratingFilter}
								onChange={(value) => {
									setRatingFilter(value);
									const filtered = filterByRating(destinations);
									setFilteredDestinations(filtered);
								}}
							/>
						</div>
					</Space>

					{/* Danh sách điểm đến */}
					<Row gutter={[16, 16]}>
						{filteredDestinations.map((destination) => (
							<Col xs={24} sm={12} md={8} lg={6} key={destination.id}>
								<Card hoverable cover={<img alt={destination.name} src={destination.image} />}>
									<Meta
										title={destination.name}
										description={
											<Space direction='vertical'>
												<Rate disabled defaultValue={destination.rating} />
												<div>{destination.price.toLocaleString('vi-VN')} VND</div>
												<div>{destination.description}</div>
											</Space>
										}
									/>
								</Card>
							</Col>
						))}
					</Row>
				</Space>
			</Card>
		</div>
	);
};

export default ExplorePage;
