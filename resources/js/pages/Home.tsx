import React from 'react';
import App from "@/layouts/App";

export default function Home({auth}: {auth: Auth}) {
    return (
        <App title={"Home"} auth={auth}>
            <h1>Home page</h1>
        </App>
    )
}
