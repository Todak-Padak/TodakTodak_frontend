import DoctorUntactReservation from "@/views/doctor/DoctorUntactReservation.vue";
import DoctorReservation from "@/views/doctor/DoctorReservation.vue";
import DoctorDetail from "@/views/hospital/DoctorDetail.vue"
export const doctorRouter = [
    {
        path: '/doctor/untact/reservation',
        name: 'DoctorUntactReservation',
        component: DoctorUntactReservation
    },
    {
        path: '/doctor/reservation',
        name: 'DoctorReservation',
        component: DoctorReservation
    },
    {
        path: '/doctor/detail',
        name: 'DoctorDetail',
        component: DoctorDetail
    }
]