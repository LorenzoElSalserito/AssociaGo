export default function TopHeader({ title, context, actions }) {
    return (
        <header className="top-header">
            <div className="top-header-title">
                <div className="top-header-context" title={context}>{context}</div>
                <h4 className="mb-0">{title}</h4>
            </div>
            <div className="top-header-actions">{actions}</div>
        </header>
    );
}
