from actions.registry import create_action, ActionType
from actions.validator import ActionValidator
from actions.kinetic import KineticLayer

def run_tests():
    validator = ActionValidator()
    kinetic = KineticLayer() # Mocking DB connection for this test

    print("--- Test 1: Validation Logic (Date Check) ---")
    try:
        # Invalid Action: End date before Start date
        act1 = create_action("update_job_status", {
            "company": "OntologyHub",
            "start_date": "2024-01-01",
            "end_date": "2023-12-31" # Error
        })
        
        is_valid, errors = validator.validate(act1)
        if not is_valid:
            print(f"✅ Validator correctly caught errors: {errors}")
        else:
            print("❌ Validator failed (Allowed invalid dates).")
            
    except Exception as e:
        print(f"Test 1 Error: {e}")

    print("\n--- Test 2: Kinetic Trigger (Stress Detection) ---")
    # Simulate 3 negative events
    events = [
        {"summary": "Lost wallet", "sentiment": "Negative"},
        {"summary": "Argued with boss", "sentiment": "Negative"},
        {"summary": "Missed the bus", "sentiment": "Negative"}
    ]
    
    for i, evt in enumerate(events):
        print(f"Injecting Event {i+1}: {evt['summary']} ({evt['sentiment']})")
        act = create_action("add_event", evt)
        is_valid, _ = validator.validate(act)
        kinetic.process_action(act, is_valid)

if __name__ == "__main__":
    run_tests()
