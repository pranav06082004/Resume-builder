import { Lock, Mail, User2 } from 'lucide-react'
import React from 'react'
import api from '../configs/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const query = new URLSearchParams(window.location.search)
    const urlStatus = query.get("status")

    const [state, setState] = React.useState(urlStatus || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
    e.preventDefault()

    console.log(import.meta.env.VITE_BASE_URL);

    try {

        const endpoint = state === "login" ? "login" : "register"

        const payload =
            state === "login"
                ? { email: formData.email, password: formData.password }
                : formData

        const { data } = await api.post(`/api/users/${endpoint}`, payload)

        dispatch(login({
            token: data.token,
            user: data.user
        }))

        localStorage.setItem('token', data.token)

        toast.success(data.message)
        navigate('/app')

    } catch (error) {
        toast.error(error?.response?.data?.message || error.message)
    }
}

    const handleChange = (e) => {

        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

    }

    const toggleState = () => {

        setState(prev => prev === "login" ? "signup" : "login")

        setFormData({
            name: '',
            email: '',
            password: ''
        })
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>

            <form
                onSubmit={handleSubmit}
                className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white"
            >

                <h1 className="text-gray-900 text-3xl mt-10 font-medium">
                    {state === "login" ? "Login" : "Sign up"}
                </h1>

                <p className="text-gray-500 text-sm mt-2">
                    Please sign in to continue
                </p>

                {state === "signup" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">

                        <User2 size={16} color='#6B7280'/>

                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            className="w-full bg-transparent border-none outline-none"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                    </div>
                )}

                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">

                    <Mail size={14} color='#6B7280'/>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email id"
                        className="w-full bg-transparent border-none outline-none"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                </div>

                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">

                    <Lock size={14} color='#6B7280'/>

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full bg-transparent border-none outline-none"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                </div>

                <button
                    type="submit"
                    className="mt-4 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                    {state === "login" ? "Login" : "Sign up"}
                </button>

                <p
                    onClick={toggleState}
                    className="text-gray-500 text-sm mt-3 mb-11 cursor-pointer"
                >

                    {state === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <span className="text-indigo-500 ml-1 hover:underline">
                        click here
                    </span>

                </p>

            </form>

        </div>
    )
}

export default Login