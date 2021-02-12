<template>
	<div>
		<v-expansion-panels accordion class="d-md-none" style="position: fixed">
			<SmallSearchFilter />
			<SmallSearchTag />
		</v-expansion-panels>
		<div style="height: 6.5em" class="d-md-none"></div>
		<Results />
	</div>
</template>

<script>
	export default {
		auth: true,
		data: () => ({
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
