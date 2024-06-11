import Vue from "vue";
import VueRouter from "vue-router";

const Home = () => import("../views/Home");
const Map = () => import("../views/map/Map");

Vue.use(VueRouter);

const routes = [
	{ path: "/", redirect: "/home" },
	{
		path: "/home",
		component: Home,
		redirect: "/map",
		children: [
			{ path: "/map", meta: { title: "航班动态" }, component: Map },
		]
	}
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
});

export default router;
