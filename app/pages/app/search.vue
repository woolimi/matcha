<template>
	<div>
		<v-expansion-panels accordion class="d-md-none">
			<SmallSearchFilter />
			<SmallSearchTag />
		</v-expansion-panels>
	</div>
</template>

<script>
	export default {
		auth: true,
		data: () => ({
			tags: {
				selected: [],
				items: ['a', 'b'],
				search: null,
			},
			mode: 1,
			open: true,
		}),
	};
</script>

<style scoped>
	.h-init {
		height: initial;
	}
</style>
