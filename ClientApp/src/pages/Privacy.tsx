export default function Privacy() {
  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h2 className="mb-3">Privacy Policy</h2>
        <div className="card">
          <div className="card-body">
            <p className="text-muted">Last updated: 25 June 2026</p>

            <h5 className="mt-3">What we collect</h5>
            <p>
              When you register we store your name, email, nickname, and (optionally) phone
              number, plus your seat reservations. Passwords are stored only as salted one-way
              hashes — never in plain text.
            </p>

            <h5 className="mt-3">How we use it</h5>
            <p>
              Your data is used solely to provide the booking service: authentication, showing
              your tickets, and managing reservations. We do not sell or share your data.
            </p>

            <h5 className="mt-3">Payment</h5>
            <p>
              This is a demonstration app. Checkout is simulated — <strong>no real card data is
              collected, processed, or stored.</strong>
            </p>

            <h5 className="mt-3">Your rights (GDPR)</h5>
            <p>
              You can view and update your data from your <strong>Profile</strong>, and you can
              <strong> permanently delete your account</strong> (and all your reservations) at any
              time from the Profile page. Security-relevant actions are recorded in an audit log.
            </p>

            <h5 className="mt-3">Contact</h5>
            <p className="mb-0">
              For privacy requests, email <strong>privacy@adafcinema.app</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
