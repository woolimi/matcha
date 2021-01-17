<template>
	<v-app>
		<div
			class="align-center justify-center d-flex flex-column"
			style="
				background-image: url(/img/home-bg.jpg);
				background-size: cover;
				background-position: center center;
				height: 100vh;
				background-attachment: fixed;
			"
		>
			<h1 class="white--text" style="font-size: 4em">Find your love</h1>
			<v-btn color="primary">create your account</v-btn>
		</div>
		<HomeNav />
		<HomeReviews />
		<HomeFooter />
	</v-app>
</template>

<script>
	export default {};
</script>

<style></style>
