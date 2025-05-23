import asyncio
import time
from r2_fns import *
from wsfile import manager
def wait_for_match_evaluations(match_ids, db, timeout=300, interval=5):
    """Poll the DB until all matches are evaluated or timeout."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        statuses = db.query(Round2Match.id, Round2Match.status)\
                     .filter(Round2Match.id.in_(match_ids)).all()
        if all(status == "evaluated" for _, status in statuses):
            return True
        asyncio.run(manager.send_message("⏳ Waiting for matches to finish..."))
        time.sleep(interval)
    raise TimeoutError("Timeout waiting for match evaluations.")

def run_round2():
    db: Session = SessionLocal()

    try:
        # asyncio.run(manager.send_message("🚀 Seeding Round 2 Groups..."))
        seed_round2_groups()
        evaluate_all_pending_matches()
        
        # asyncio.run(manager.send_message("📊 Computing Standings..."))
        qf_teams = compute_group_standings()

        # asyncio.run(manager.send_message("⚔️  Seeding Quarterfinals..."))
        qf_match_ids = seed_next_knockout_round(qf_teams, "qf")
        evaluate_all_pending_matches()
        wait_for_match_evaluations(qf_match_ids, db)

        # asyncio.run(manager.send_message("🏆 Getting QF Winners..."))
        sf_teams = get_winners(qf_match_ids)

        # asyncio.run(manager.send_message("⚔️  Seeding Semifinals..."))
        sf_match_ids = seed_next_knockout_round(sf_teams, "sf")
        evaluate_all_pending_matches()
        wait_for_match_evaluations(sf_match_ids, db)

        # asyncio.run(manager.send_message("🏆 Getting SF Winners..."))
        final_teams = get_winners(sf_match_ids)

        # asyncio.run(manager.send_message("⚔️  Seeding Finals..."))
        final_match_ids = seed_next_knockout_round(final_teams, "f")
        evaluate_all_pending_matches()
        wait_for_match_evaluations(final_match_ids, db)

        final_winner = get_winners(final_match_ids)
        # asyncio.run(manager.send_message(f"🏆 Final Winner: {final_winner}"))
        return final_winner

    finally:
        db.close()
