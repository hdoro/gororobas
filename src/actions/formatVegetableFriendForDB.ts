export function formatVegetableFriendForDB(
	friend_id: string,
	vegetable_id: string,
) {
	return {
		id: friend_id,
		unique_key: [vegetable_id, friend_id]
			.sort((a, b) => a.localeCompare(b))
			.join('-'),
	}
}
