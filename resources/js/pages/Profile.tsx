import App from "@/layouts/App";

export default function Profile({auth}: {auth: Auth}) {
    return (
        <App title={'Profile'} auth={auth}>
            <h1>Profile</h1>
        </App>
    )
}
