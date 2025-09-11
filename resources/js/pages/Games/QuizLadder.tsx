import App from "@/layouts/App";

interface Props {
    auth: Auth;
}

export default function QuizLadder({auth}: Props) {
    return (
        <App title={'Quiz Ladder'} auth={auth}>

        </App>
    )
}
